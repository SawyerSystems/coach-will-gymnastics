import { Container, Heading, Html, Text } from '@react-email/components';

export function ParentWelcome({ parentName, loginLink }: { parentName: string; loginLink: string; }) {
  return (
    <Html>
      <Container style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
        <Heading style={{ color: '#6366F1' }}>Welcome to Coach Will Tumbles! 🤸‍♀️</Heading>
        
        <Text>Hi {parentName},</Text>
        
        <Text>Thank you for joining the Coach Will Tumbles family! We're excited to have you and your young athlete(s) on board.</Text>
        
        <div style={{ margin: '20px 0' }}>
          <Heading as="h2" style={{ fontSize: '18px', color: '#4F46E5' }}>What happens next?</Heading>
          <Text>1. Complete your athlete's profile information</Text>
          <Text>2. Book your first gymnastics lesson</Text>
          <Text>3. Fill out the required waivers</Text>
          <Text>4. Prepare for an amazing gymnastics experience!</Text>
        </div>
        
        <div style={{ margin: '20px 0' }}>
          <a 
            href={loginLink}
            style={{
              display: 'inline-block',
              backgroundColor: '#6366F1',
              color: 'white',
              padding: '10px 20px',
              borderRadius: '4px',
              textDecoration: 'none',
              fontWeight: 'bold'
            }}
          >
            Access Your Parent Portal
          </a>
        </div>
        
        <Text style={{ marginTop: '30px' }}>If you have any questions, feel free to contact us at will@coachwilltumbles.com.</Text>
        
        <Text>Looking forward to seeing your athlete flourish!</Text>
        
        <Text style={{ marginTop: '20px' }}>Best flips,</Text>
        <Text>Coach Will 🏆</Text>
      </Container>
    </Html>
  );
}
