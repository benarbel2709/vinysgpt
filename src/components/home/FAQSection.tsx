import { useNavigate } from "react-router-dom";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const FAQ_ITEMS = [
  {
    q: "Is Vinys safe for people with medical conditions?",
    a: "Vinys is designed specifically for people navigating physical and health conditions. Every session is filtered against your restrictions and adapted to your capacity. However, the platform provides educational movement guidance only and is not a substitute for medical advice. Always consult your healthcare provider before beginning a new movement program.",
  },
  {
    q: "Do I need any yoga experience?",
    a: "No. Vinys is built for people starting from scratch or returning after injury or illness. Every session is matched to your current body.",
  },
  {
    q: "How is this different from a yoga video class?",
    a: "A video class is the same for everyone. Vinys adapts to your condition, your energy level, and your available time — every session, every day.",
  },
  {
    q: "Is there a free trial?",
    a: "Yes. You can start building your practice right now at no cost.",
    cta: true,
  },
  {
    q: "What equipment do I need?",
    a: "Nothing. Most sessions can be done with just a mat and a wall. You can add equipment like a chair, strap, or bolster in your settings.",
  },
  {
    q: "How long are the sessions?",
    a: "You choose: 10, 15, 20, 30, or 45 minutes. Vinys adapts the session content to your chosen time.",
  },
];

export default function FAQSection() {
  const navigate = useNavigate();

  return (
    <section className="w-full vinys-section">
      <div className="vinys-container max-w-[720px] mx-auto">
        <h2
          className="font-display font-bold text-foreground text-center mb-8"
          style={{ fontSize: "clamp(24px, 2.8vw, 32px)" }}
        >
          Frequently asked questions
        </h2>
        <Accordion type="single" collapsible className="w-full">
          {FAQ_ITEMS.map((item, i) => (
            <AccordionItem key={i} value={`faq-${i}`}>
              <AccordionTrigger className="text-left text-[15px] font-semibold text-foreground hover:no-underline">
                {item.q}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground text-[15px] leading-relaxed">
                {item.a}
                {item.cta && (
                  <>
                    {" "}
                    <button
                      onClick={() => navigate("/onboarding")}
                      className="text-primary font-semibold underline underline-offset-2 hover:text-primary/80 transition-colors"
                    >
                      Start your plan →
                    </button>
                  </>
                )}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
