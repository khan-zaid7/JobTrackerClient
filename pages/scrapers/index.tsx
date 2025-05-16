// pages/scrapers/index.tsx
import Link from 'next/link';
import Layout from '../../components/Layout';
import { Card } from '../../components/Card';
import { ArrowRight } from 'lucide-react';

export default function ScraperSelector() {
  const scrapers = [
    {
      name: 'LinkedIn Scraper',
      id: 'linkedin',
      description: 'Scrape jobs from LinkedIn using Playwright automation.',
      enabled: true
    },
    {
      name: 'Indeed Scraper',
      id: 'indeed',
      description: 'Coming soon: Job scraping support from Indeed.',
      enabled: false
    },
    {
      name: 'Workday Scraper',
      id: 'workday',
      description: 'Coming soon: Extract jobs from Workday career portals.',
      enabled: false
    }
  ];

  return (
    <Layout>
      <div className="container mt-5">
        <h2 className="mb-4">Available Job Scrapers</h2>
        <div className="row">
          {scrapers.map(scraper => (
            <div className="col-md-4 mb-4" key={scraper.id}>
              <Card className="p-4 h-100 shadow rounded border">
                <h5 className="mb-2">{scraper.name}</h5>
                <p className="text-muted" style={{ minHeight: 60 }}>{scraper.description}</p>
                {scraper.enabled ? (
                  <Link href={`/scrapers/${scraper.id}`} className="btn btn-primary w-100 mt-3">
                    Open <ArrowRight size={16} className="ms-2" />
                  </Link>
                ) : (
                  <button className="btn btn-secondary w-100 mt-3" disabled>
                    Coming Soon
                  </button>
                )}
              </Card>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
}
