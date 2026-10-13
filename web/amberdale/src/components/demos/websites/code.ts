/** The page source typed in the Websites demo, split by the section it renders. */
export const HOLM_SEGMENTS: { stage: number; code: string }[] = [
  {
    stage: 0,
    code: `import { Nav, Hero, Picture, Button } from "@/components";
import { Projects, Footer } from "@/components";
import { projects } from "@/content/projects";

export default function Home() {
  return (
    <main className="holm">`,
  },
  {
    stage: 1,
    code: `      <Nav
        logo="Holm Arkitektur"
        links={["Projects", "Practice", "Journal", "Contact"]}
      />`,
  },
  {
    stage: 2,
    code: `      <Hero
        eyebrow="Architects in Bergen since 2011"
        title="Houses that let the landscape lead."
      />`,
  },
  {
    stage: 3,
    code: `      <Picture
        src="/images/fjord.webp"
        alt="A fjord between steep mountainsides"
        grade="quiet"
        ratio={16 / 7}
      />`,
  },
  {
    stage: 4,
    code: `      <Button href="/commission" variant="solid">
        Start a commission
      </Button>`,
  },
  {
    stage: 5,
    code: `      <Projects heading="Selected work" columns={3}>
        {projects.map((p) => (
          <Projects.Item key={p.slug} {...p} />
        ))}
      </Projects>`,
  },
  {
    stage: 6,
    code: `      <Footer
        address="Bryggen 12, 5003 Bergen"
        email="studio@holmarkitektur.no"
      />
    </main>
  );
}`,
  },
];
