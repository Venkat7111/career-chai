import './globals.css';
import { Toaster } from 'react-hot-toast';

export const metadata = {
  title: 'CAREER WITH CHAITHANYA — Learn. Complete. Grow.',
  description: 'Career and Task Management Platform by Chaitanya Madakasira',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Toaster position="top-right" />
        {children}
      </body>
    </html>
  );
}
