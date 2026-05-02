export default function Head() {
  return (
    <>
      {/* Event snippet for Lead views key page conversion page */}
      <script
        dangerouslySetInnerHTML={{
          __html: `
            gtag('event', 'conversion', {
              'send_to': 'AW-18040131212/Ua8ACJ_RnKYcEIydmppD',
              'value': 1.0,
              'currency': 'USD'
            });
          `,
        }}
      />
    </>
  );
}
