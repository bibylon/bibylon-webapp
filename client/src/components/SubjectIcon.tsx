import { 
  TestTube, 
  Atom, 
  Calculator, 
  Book, 
  Landmark, 
  TrendingUp, 
  Leaf, 
  Globe,
  Brain,
  Languages
} from "lucide-react";

interface SubjectIconProps {
  subject: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export default function SubjectIcon({ subject, size = "md", className = "" }: SubjectIconProps) {
  const getIcon = () => {
    const subjectLower = subject.toLowerCase();
    
    switch (subjectLower) {
      case 'biology':
        return TestTube;
      case 'chemistry':
        return Atom;
      case 'physics':
        return Atom;
      case 'mathematics':
      case 'math':
        return Calculator;
      case 'polity':
      case 'civics':
        return Landmark;
      case 'economy':
      case 'economics':
        return TrendingUp;
      case 'environment':
        return Leaf;
      case 'geography':
        return Globe;
      case 'history':
        return Book;
      case 'english':
        return Languages;
      case 'reasoning':
      case 'logical reasoning':
        return Brain;
      case 'general knowledge':
      case 'current affairs':
        return Book;
      default:
        return Book;
    }
  };

  const getSubjectClass = () => {
    const subjectLower = subject.toLowerCase();
    
    switch (subjectLower) {
      case 'biology':
        return 'subject-bio';
      case 'chemistry':
        return 'subject-chemistry';
      case 'physics':
        return 'subject-physics';
      case 'mathematics':
      case 'math':
        return 'subject-math';
      case 'polity':
      case 'civics':
        return 'subject-polity';
      case 'economy':
      case 'economics':
        return 'subject-economy';
      case 'environment':
        return 'subject-environment';
      case 'geography':
        return 'subject-environment';
      case 'history':
        return 'subject-polity';
      case 'english':
        return 'subject-physics';
      case 'reasoning':
      case 'logical reasoning':
        return 'subject-chemistry';
      case 'general knowledge':
      case 'current affairs':
        return 'subject-polity';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  const getSizeClass = () => {
    switch (size) {
      case 'sm':
        return 'w-8 h-8';
      case 'md':
        return 'w-10 h-10';
      case 'lg':
        return 'w-12 h-12';
      default:
        return 'w-10 h-10';
    }
  };

  const getIconSize = () => {
    switch (size) {
      case 'sm':
        return 'w-4 h-4';
      case 'md':
        return 'w-5 h-5';
      case 'lg':
        return 'w-6 h-6';
      default:
        return 'w-5 h-5';
    }
  };

  const Icon = getIcon();

  return (
    <div className={`${getSizeClass()} ${getSubjectClass()} rounded-full flex items-center justify-center ${className}`}>
      <Icon className={getIconSize()} />
    </div>
  );
}
