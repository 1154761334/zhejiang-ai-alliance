export interface Company {
    id: string;
    user_id: string; // Directus User ID
    company_name: string;
    region: string;
    tracks: string[]; // JSON array
    role: string;
    bp_file?: string; // Directus File ID
    financing_need: string;
    market_needs: string[];
    tech_needs: string[];
    tech_complement_desc?: string;
    surveyor: string;
    status: 'published' | 'draft' | 'archived';
}

export interface Product {
    id: string;
    company_id: string | Company;
    name: string;
    type: 'Copilot' | 'Autonomous' | 'Multi-Agent';
    function_desc: string;
    maturity: 'Demo' | 'Trial' | 'Commercial';
}

export interface Contact {
    id: string;
    company_id: string | Company;
    name: string;
    position: string;
    phone: string;
    policy_interests: string[];
    site_photos: string[]; // Array of Directus File IDs
}

export interface Schema {
    companies: Company[];
    products: Product[];
    contacts: Contact[];
}
