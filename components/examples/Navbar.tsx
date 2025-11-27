import { Navbar } from '../navbar';
import { ThemeProvider } from '../theme-provider';

export default function NavbarExample() {
  return (
    <ThemeProvider>
      <Navbar />
    </ThemeProvider>
  );
}
