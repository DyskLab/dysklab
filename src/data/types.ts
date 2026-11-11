export interface Step { name: string; text: string }
export interface Principle { title: string; text: string }
export interface Service { name: string; text: string }
export interface ServiceGroup { title: string; intro: string; items: Service[] }
export interface App {
  slug: string; page: string; name: string; kind: string; kind_en: string; platform: string; icon: string; text: string;
  stack: string[]; projectUrl?: string; repo: string;
}
export interface Case {
  slug: string; kind: string; client: string; sector: string; title: string;
  sector_en?: string; title_en?: string;
  problem: string; built: string; result: string;
  draft?: boolean; client_project?: boolean;
  image: string | null; stack: string[]; projectUrl: string; demo?: string;
}
export interface Testimonial {
  quote: string; name: string; role?: string; company?: string; rating?: number; draft?: boolean;
}
export interface Content {
  description: string; whatsapp: string; email: string;
  process: Step[]; principles: Principle[]; service_groups: ServiceGroup[];
  apps: App[]; cases: Case[]; testimonials: Testimonial[];
}
