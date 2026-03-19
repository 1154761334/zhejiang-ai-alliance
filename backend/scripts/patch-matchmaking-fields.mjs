import { createDirectus, rest, authentication, readFields, createField } from '@directus/sdk';

const directus = createDirectus('http://localhost:8055')
    .with(rest())
    .with(authentication('json'));

async function patch() {
    try {
        await directus.login({ email: 'admin@example.com', password: 'password' });
        console.log("Logged in successfully.");

        const existingFields = await directus.request(readFields('survey_needs'));
        const fieldNames = existingFields.map(f => f.field);

        if (!fieldNames.includes('ticket_status')) {
            console.log("Creating 'ticket_status' field...");
            await directus.request(createField('survey_needs', {
                field: 'ticket_status',
                type: 'string',
                meta: {
                    interface: 'select-dropdown',
                    options: { choices: [{ text: "待处理", value: "pending" }, { text: "跟进中", value: "in_progress" }, { text: "已解决", value: "resolved" }] },
                    display: 'labels',
                    display_options: {
                        choices: [
                            { value: 'pending', text: '待处理', foreground: '#FFFFFF', background: '#FFC107' },
                            { value: 'in_progress', text: '跟进中', foreground: '#FFFFFF', background: '#2196F3' },
                            { value: 'resolved', text: '已解决', foreground: '#FFFFFF', background: '#4CAF50' }
                        ]
                    }
                },
                schema: { default_value: 'pending' }
            }));
        } else {
            console.log("'ticket_status' already exists.");
        }

        if (!fieldNames.includes('assignee')) {
            console.log("Creating 'assignee' field...");
            await directus.request(createField('survey_needs', {
                field: 'assignee',
                type: 'string', // Just string for simplicity, or we could link it to directus_users
                meta: {
                    interface: 'input',
                    note: '跟进人'
                }
            }));
        } else {
            console.log("'assignee' already exists.");
        }

        if (!fieldNames.includes('tags')) {
            console.log("Creating 'tags' field...");
            await directus.request(createField('survey_needs', {
                field: 'tags',
                type: 'json',
                meta: {
                    interface: 'tags',
                    note: '需求标签'
                }
            }));
        } else {
            console.log("'tags' already exists.");
        }

        console.log("Matchmaking fields patched successfully!");

    } catch (error) {
        console.error("Error setting up matchmaking fields:", error);
    }
}

patch();
