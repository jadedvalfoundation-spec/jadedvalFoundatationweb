// This route group is superseded by app/[lang]/(user)/
// It is kept only so the original (user) routes still resolve during migration.
// The proxy redirects all non-locale paths to /{lang}/..., so this layout
// should not be reached in normal operation.
export default function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
