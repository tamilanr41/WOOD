import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader, LogosRow } from "@/components/Sections";
import { IMG, team } from "@/lib/data";

export const metadata: Metadata = { title: "Our Team" };

export default function TeamPage() {
  return (
    <>
      <PageHeader title="Our Team" crumb="Our Team" image={IMG.topImg} />

      <section className="section">
        <div className="container">
          <div className="section-head">
            <div>
              <span className="eyebrow">Our goal</span>
              <h2 className="h2" style={{ maxWidth: "24ch" }}>
                To be more than a team — a trusted part of your daily commitment
                to nature and responsible stewardship
              </h2>
            </div>
            <Link href="/contacts" className="btn btn--outline">
              Contact Us
            </Link>
          </div>
          <p className="lead" style={{ marginBottom: 40 }}>
            Comprehensive service includes project planning, manufacturing,
            finishing and warranty support so clients can focus on design.
          </p>

          <div className="team-grid">
            {team.map((member, i) => (
              <article className="team-card" key={member.name + i}>
                <div className="team-card__media">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={member.image} alt={member.name} />
                </div>
                <div className="team-card__body">
                  <h4>{member.name}</h4>
                  <span className="team-card__role">{member.role}</span>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <LogosRow />
    </>
  );
}
