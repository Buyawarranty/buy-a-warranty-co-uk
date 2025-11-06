import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
  Hr,
} from 'npm:@react-email/components@0.0.22'
import * as React from 'npm:react@18.3.1'

interface AbandonedCartEmailProps {
  firstName: string;
  vehicleReg: string;
  vehicleMake: string;
  vehicleModel: string;
  planName?: string;
  continueUrl: string;
  triggerType: 'pricing_page_view' | 'plan_selected' | 'pricing_page_view_24h' | 'pricing_page_view_72h';
}

export const AbandonedCartEmail = ({
  firstName = 'there',
  vehicleReg = '',
  vehicleMake = '',
  vehicleModel = '',
  planName = '',
  continueUrl = '',
  triggerType = 'plan_selected'
}: AbandonedCartEmailProps) => {
  
  // Content based on trigger type
  const getContent = () => {
    switch(triggerType) {
      case 'pricing_page_view_24h':
        return {
          subject: "Still thinking it over? Here's 10% off to help decide",
          heading: "Still thinking it over? Here's 10% off to help decide",
          intro: `Re: Your ${vehicleMake} warranty quote is saved – complete it in seconds`,
          body: "We understand warranties can feel complicated. But with Buy A Warranty, it's simple:",
          promoCode: "SAVE10NOW",
          promoText: "Use promo code SAVE10NOW to get 10% off your warranty quote. Just complete your purchase within the next 24 hours.",
          ctaText: "Return to Your Cart"
        };
      
      case 'pricing_page_view_72h':
        return {
          subject: "Last chance to secure your quote – 10% off ends soon",
          heading: "Last chance to secure your quote – 10% off ends soon",
          intro: `Re: Protect Your Vehicle Registration: ${vehicleReg}`,
          body: "Your warranty quote is about to expire. Don't miss out on affordable cover and peace of mind.",
          promoCode: "SAVE10NOW",
          promoText: "Use promo code SAVE10NOW to get 10% off before it's gone.",
          ctaText: "Return to Your Cart"
        };
      
      default:
        return {
          subject: "Your warranty quote is still here – don't risk costly repairs",
          heading: "Get 3 Extra Months Cover FREE - Limited Time!",
          intro: `You left your warranty quote behind for your ${vehicleMake} ${vehicleModel} (Registration: ${vehicleReg}). It's still in your cart, ready when you are.`,
          body: "We've saved everything so you can jump back in anytime.",
          promoCode: null,
          promoText: "Don't risk costly repairs. Get covered today.",
          ctaText: "Return to Your Cart"
        };
    }
  };

  const content = getContent();

  return (
    <Html>
      <Head />
      <Preview>{content.subject}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={header}>
            <Img
              src="https://buyawarranty.co.uk/logo.png"
              width="180"
              height="50"
              alt="Buy A Warranty"
              style={logo}
            />
          </Section>

          <Section style={content_section}>
            <Heading style={h1}>{content.heading}</Heading>
            
            <Text style={text}>Hi {firstName},</Text>
            
            <Text style={text}>{content.intro}</Text>
            
            <Text style={text}>{content.body}</Text>

            {content.promoCode && (
              <Section style={promoSection}>
                <Text style={promoText}>{content.promoText}</Text>
                <Text style={promoCode}>{content.promoCode}</Text>
              </Section>
            )}

            <Section style={benefitsSection}>
              <Text style={benefitsHeading}>Why choose Buy A Warranty?</Text>
              <Text style={benefitItem}>✓ Flexible cover options</Text>
              <Text style={benefitItem}>✓ UK-based support team</Text>
              <Text style={benefitItem}>✓ Fast, easy claims</Text>
              <Text style={benefitItem}>✓ Cancel within 14 days for a full refund</Text>
              <Text style={benefitItem}>✓ Get covered in 60 seconds!</Text>
            </Section>

            <Section style={ctaSection}>
              <Link href={continueUrl} style={button}>
                👉 {content.ctaText}
              </Link>
            </Section>

            <Text style={tagline}>Warranty that works when your vehicle doesn't!</Text>

            <Hr style={hr} />

            <Text style={footer}>
              <strong>Still have questions?</strong><br />
              Just reply to this email or get in touch.
            </Text>

            <Text style={footer}>
              Best regards,<br />
              The Buy A Warranty Team<br />
              <Link href="https://buyawarranty.co.uk" style={link}>
                buyawarranty.co.uk
              </Link>
            </Text>

            <Text style={contactFooter}>
              📧 support@buyawarranty.co.uk<br />
              📞 0330 229 5040
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}

export default AbandonedCartEmail

// Styles
const main = {
  backgroundColor: '#f6f9fc',
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
}

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '20px 0 48px',
  marginBottom: '64px',
  maxWidth: '600px',
}

const header = {
  padding: '24px',
  textAlign: 'center' as const,
}

const logo = {
  margin: '0 auto',
}

const content_section = {
  padding: '0 48px',
}

const h1 = {
  color: '#1a1a1a',
  fontSize: '24px',
  fontWeight: '700',
  lineHeight: '1.3',
  margin: '16px 0',
}

const text = {
  color: '#484848',
  fontSize: '16px',
  lineHeight: '24px',
  margin: '16px 0',
}

const benefitsSection = {
  backgroundColor: '#f8f9fa',
  borderRadius: '8px',
  padding: '20px',
  margin: '24px 0',
}

const benefitsHeading = {
  color: '#1a1a1a',
  fontSize: '18px',
  fontWeight: '600',
  margin: '0 0 12px 0',
}

const benefitItem = {
  color: '#484848',
  fontSize: '15px',
  lineHeight: '24px',
  margin: '4px 0',
}

const promoSection = {
  backgroundColor: '#fff3cd',
  border: '2px solid #ffc107',
  borderRadius: '8px',
  padding: '20px',
  margin: '24px 0',
  textAlign: 'center' as const,
}

const promoText = {
  color: '#856404',
  fontSize: '16px',
  fontWeight: '600',
  margin: '0 0 12px 0',
}

const promoCode = {
  backgroundColor: '#ffc107',
  color: '#000',
  fontSize: '24px',
  fontWeight: 'bold',
  padding: '12px 24px',
  borderRadius: '4px',
  display: 'inline-block',
  letterSpacing: '2px',
}

const ctaSection = {
  textAlign: 'center' as const,
  margin: '32px 0',
}

const button = {
  backgroundColor: '#0066cc',
  borderRadius: '6px',
  color: '#fff',
  fontSize: '18px',
  fontWeight: 'bold',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '16px 32px',
}

const tagline = {
  color: '#0066cc',
  fontSize: '18px',
  fontWeight: '600',
  textAlign: 'center' as const,
  margin: '24px 0',
}

const hr = {
  borderColor: '#e6ebf1',
  margin: '32px 0',
}

const footer = {
  color: '#8898aa',
  fontSize: '14px',
  lineHeight: '20px',
  margin: '16px 0',
}

const contactFooter = {
  color: '#8898aa',
  fontSize: '13px',
  lineHeight: '20px',
  margin: '8px 0',
}

const link = {
  color: '#0066cc',
  textDecoration: 'underline',
}
