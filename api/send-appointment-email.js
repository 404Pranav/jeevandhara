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
            || normalizeErrorReason(value.name)
            || normalizeErrorReason(value.ErrorMessage)
            || normalizeErrorReason(value.ErrorInfo)
            || normalizeErrorReason(value.ErrorIdentifier)
            || normalizeErrorReason(value.StatusText);

        if (direct) return direct;

        if (Array.isArray(value.errors)) {
            const listReason = value.errors
                .map((item) => normalizeErrorReason(item))
                .filter(Boolean)
                .join('; ');

            if (listReason) return listReason;
        }

        if (Array.isArray(value.Errors)) {
            const listReason = value.Errors
                .map((item) => normalizeErrorReason(item))
                .filter(Boolean)
                .join('; ');

            if (listReason) return listReason;
        }

        if (value.details) {
            return normalizeErrorReason(value.details);
        }

        if (value.Details) {
            return normalizeErrorReason(value.Details);
        }
    }

    return '';
}

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const MAILJET_API_KEY = process.env.MAILJET_API_KEY || 'mailjet_api_key_here';
    const MAILJET_API_SECRET = process.env.MAILJET_API_SECRET || 'mailjet_api_secret_here';
    const MAILJET_FROM_EMAIL = process.env.MAILJET_FROM_EMAIL || 'no-reply@example.com';
    const MAILJET_FROM_NAME = process.env.MAILJET_FROM_NAME || 'Jeevandhara Blood Network';

    if (
        !MAILJET_API_KEY
        || MAILJET_API_KEY === 'mailjet_api_key_here'
        || !MAILJET_API_SECRET
        || MAILJET_API_SECRET === 'mailjet_api_secret_here'
    ) {
        return res.status(500).json({
            error: 'Mailjet credentials are not configured. Set MAILJET_API_KEY and MAILJET_API_SECRET environment variables.'
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
    const textPart = [
        'Your appointment is fixed',
        '',
        `Reference: ${safe.appointmentRef}`,
        `Name: ${safe.fullName}`,
        `Center: ${safe.center}`,
        `Date: ${safe.date}`,
        `Time: ${safe.time}`,
        `Blood Group: ${safe.bloodGroup}`,
        `Gender: ${safe.gender}`,
        `Phone: ${safe.phone || '-'}`,
        `Email: ${safe.email}`,
        '',
        'Thank you for choosing to save lives.',
        'Jeevandhara Blood Network'
    ].join('\n');

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
        const basicAuth = Buffer.from(`${MAILJET_API_KEY}:${MAILJET_API_SECRET}`).toString('base64');

        const mailjetResponse = await fetch('https://api.mailjet.com/v3.1/send', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Basic ${basicAuth}`
            },
            body: JSON.stringify({
                Messages: [
                    {
                        From: {
                            Email: MAILJET_FROM_EMAIL,
                            Name: MAILJET_FROM_NAME
                        },
                        To: [
                            {
                                Email: email,
                                Name: fullName || email
                            }
                        ],
                        Subject: subject,
                        TextPart: textPart,
                        HTMLPart: html,
                        CustomID: safe.appointmentRef
                    }
                ]
            })
        });

        const payload = await mailjetResponse.json().catch(() => ({}));

        if (!mailjetResponse.ok) {
            const reason = normalizeErrorReason(payload);
            return res.status(mailjetResponse.status).json({
                error: 'Failed to send email with Mailjet',
                reason,
                details: payload
            });
        }

        const firstMessage = payload && Array.isArray(payload.Messages) ? payload.Messages[0] : null;
        const firstError = firstMessage && Array.isArray(firstMessage.Errors) ? firstMessage.Errors[0] : null;

        if (firstError) {
            const reason = normalizeErrorReason(firstError) || 'Mailjet returned a delivery error';
            return res.status(502).json({
                error: 'Mailjet rejected the message',
                reason,
                details: payload
            });
        }

        const firstRecipient = firstMessage && Array.isArray(firstMessage.To) ? firstMessage.To[0] : null;
        const messageId = firstRecipient && (firstRecipient.MessageID || firstRecipient.MessageUUID)
            ? (firstRecipient.MessageID || firstRecipient.MessageUUID)
            : null;

        return res.status(200).json({
            success: true,
            id: messageId
        });
    } catch (error) {
        return res.status(500).json({
            error: 'Unexpected server error while sending appointment email',
            details: String(error?.message || error)
        });
    }
}
