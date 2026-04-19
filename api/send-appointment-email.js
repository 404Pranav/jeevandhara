function escapeHtml(value) {
    return String(value ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

function getBody(req) {
    if (!req || req.body === undefined || req.body === null) return {};
    if (typeof req.body === 'string') {
        try {
            return JSON.parse(req.body);
        } catch (error) {
            return {};
        }
    }
    return req.body;
}

function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email || '').trim());
}

function normalizeErrorReason(value) {
    if (typeof value === 'string' && value.trim()) {
        return value.trim();
    }

    if (Array.isArray(value)) {
        for (const item of value) {
            const reason = normalizeErrorReason(item);
            if (reason) return reason;
        }
        return '';
    }

    if (value && typeof value === 'object') {
        const direct = normalizeErrorReason(value.reason)
            || normalizeErrorReason(value.error)
            || normalizeErrorReason(value.message)
            || normalizeErrorReason(value.name);

        if (direct) return direct;

        if (Array.isArray(value.errors)) {
            const listReason = value.errors
                .map((item) => normalizeErrorReason(item))
                .filter(Boolean)
                .join('; ');

            if (listReason) return listReason;
        }

        if (value.details) {
            return normalizeErrorReason(value.details);
        }
    }

    return '';
}

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const RESEND_API_KEY = process.env.RESEND_API_KEY || 're_xxxxxxxxx';
    const RESEND_FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev';

    if (!RESEND_API_KEY || RESEND_API_KEY === 're_xxxxxxxxx') {
        return res.status(500).json({
            error: 'Resend API key is not configured. Replace re_xxxxxxxxx with your real API key via RESEND_API_KEY environment variable.'
        });
    }

    const body = getBody(req);
    const appointmentRef = body.appointmentRef || `BBA-${Date.now().toString().slice(-8)}`;
    const fullName = String(body.fullName || '').trim();
    const phone = String(body.phone || '').trim();
    const email = String(body.email || '').trim();
    const bloodGroup = String(body.bloodGroup || 'Not selected');
    const gender = String(body.gender || 'Not selected');
    const center = String(body.center || 'Not selected');
    const date = String(body.date || 'Not selected');
    const time = String(body.time || 'Not selected');

    if (!fullName) {
        return res.status(400).json({ error: 'Missing fullName' });
    }

    if (!isValidEmail(email)) {
        return res.status(400).json({ error: 'Invalid email address' });
    }

    const safe = {
        appointmentRef: escapeHtml(appointmentRef),
        fullName: escapeHtml(fullName),
        phone: escapeHtml(phone),
        email: escapeHtml(email),
        bloodGroup: escapeHtml(bloodGroup),
        gender: escapeHtml(gender),
        center: escapeHtml(center),
        date: escapeHtml(date),
        time: escapeHtml(time)
    };

    const subject = `Your appointment is fixed - ${safe.appointmentRef}`;
    const html = `
        <div style="font-family: Arial, sans-serif; color: #1f2937; line-height: 1.5;">
            <h2 style="margin-bottom: 8px;">Your appointment is fixed</h2>
            <p>Hi <strong>${safe.fullName}</strong>, your Jeevandhara appointment is fixed.</p>
            <table style="border-collapse: collapse; margin-top: 12px;">
                <tr><td style="padding: 6px 10px; font-weight: 600;">Reference</td><td style="padding: 6px 10px;">${safe.appointmentRef}</td></tr>
                <tr><td style="padding: 6px 10px; font-weight: 600;">Center</td><td style="padding: 6px 10px;">${safe.center}</td></tr>
                <tr><td style="padding: 6px 10px; font-weight: 600;">Date</td><td style="padding: 6px 10px;">${safe.date}</td></tr>
                <tr><td style="padding: 6px 10px; font-weight: 600;">Time</td><td style="padding: 6px 10px;">${safe.time}</td></tr>
                <tr><td style="padding: 6px 10px; font-weight: 600;">Blood Group</td><td style="padding: 6px 10px;">${safe.bloodGroup}</td></tr>
                <tr><td style="padding: 6px 10px; font-weight: 600;">Gender</td><td style="padding: 6px 10px;">${safe.gender}</td></tr>
                <tr><td style="padding: 6px 10px; font-weight: 600;">Phone</td><td style="padding: 6px 10px;">${safe.phone || '-'}</td></tr>
                <tr><td style="padding: 6px 10px; font-weight: 600;">Email</td><td style="padding: 6px 10px;">${safe.email}</td></tr>
            </table>
            <p style="margin-top: 16px;">Thank you for choosing to save lives.</p>
            <p style="font-size: 12px; color: #6b7280;">Jeevandhara Blood Network</p>
        </div>
    `;

    try {
        const resendResponse = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${RESEND_API_KEY}`
            },
            body: JSON.stringify({
                from: RESEND_FROM_EMAIL,
                to: [email],
                subject,
                html
            })
        });

        const payload = await resendResponse.json().catch(() => ({}));

        if (!resendResponse.ok) {
            const reason = normalizeErrorReason(payload);
            return res.status(resendResponse.status).json({
                error: 'Failed to send email with Resend',
                reason,
                details: payload
            });
        }

        return res.status(200).json({
            success: true,
            id: payload?.id || null
        });
    } catch (error) {
        return res.status(500).json({
            error: 'Unexpected server error while sending appointment email',
            details: String(error?.message || error)
        });
    }
}
