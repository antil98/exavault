export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <header>
        <h2>Navigation</h2>
      </header>
      <div>
        {children}
      </div>
    </>
  );
}
