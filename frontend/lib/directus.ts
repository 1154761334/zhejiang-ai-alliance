import { createDirectus, rest } from '@directus/sdk';

export interface Article {
    id: string;
    title: string;
    content: string;
    summary: string;
    slug: string;
    publish_date: string;
    cover: string;
    category: string;
}

export interface Member {
    id: string;
    name: string;
    level: string;
    website: string;
    description: string;
    logo: string;
}

export interface Application {
    id: string;
    company_name: string;
    contact_person: string;
    phone: string;
    status: string;
}

interface Schema {
    articles: Article[];
    members: Member[];
    applications: Application[];
    companies: any[];
    products: any[];
    case_studies: any[];
    survey_needs: any[];
    compliance_risks: any[];
}

const globalForDirectus = global as unknown as { directus: any };

export const directus =
    globalForDirectus.directus ||
    createDirectus<Schema>(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8055')
        .with(rest());

if (process.env.NODE_ENV !== 'production') globalForDirectus.directus = directus;

