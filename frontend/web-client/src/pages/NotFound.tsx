import { Button } from '@libi/shared-ui';
import { Home } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="page-container flex items-center justify-center">
      <div className="text-center content-padding">
        <h1 className="text-6xl font-bold text-primary mb-4">404</h1>
        <p className="text-xl text-muted-foreground mb-8">הדף שחיפשת לא נמצא</p>
        <Button onClick={() => navigate('/')}>
          <Home className="w-5 h-5 ml-2" />
          חזרה לדף הבית
        </Button>
      </div>
    </div>
  );
}
