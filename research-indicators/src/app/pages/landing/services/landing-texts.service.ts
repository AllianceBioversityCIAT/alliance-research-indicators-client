import { Injectable, signal } from '@angular/core';
import { Card, Faq } from '../interfaces/landing.interface';

@Injectable({
  providedIn: 'root'
})
export class LandingTextsService {
  faqList = signal<Faq[]>([
    {
      question: 'WHAT IS THE ALLIANCE REPORTING TOOL?',
      answer: '...'
    },
    {
      question: 'What is the Alliance Reporting Tool?',
      answer: '...'
    },
    {
      question: 'How do I get started with creating a new result?',
      answer: '...'
    },
    {
      question: 'How do I get started with creating a new result?',
      answer: '...'
    },
    {
      question: 'What are indicators?',
      answer: '...'
    },
    {
      question: 'What are indicators?',
      answer: '...'
    },
    {
      question: 'What type of help can I expect from AI feature?',
      answer: '...'
    },
    {
      question: 'What type of help can I expect from AI feature?',
      answer: '...'
    }
  ]);

  cardList = signal<Card[]>([
    {
      icon: 'images/users.png',
      title: 'CAPACITY SHARING',
      subtitle: 'Output',
      description:
        'Number of individuals trained or engaged by Alliance staff, aiming to lead to behavioral changes in knowledge, attitude, skills, and practice among CGIAR and non-CGIAR personnel.'
    },
    {
      icon: 'images/mask-group.png',
      title: 'KNOWLEDGE PRODUCT',
      subtitle: 'Output',
      description:
        "A finalized data asset that is integral to a project's Theory of Change (ToC). It is created for use by project actors and should not include drafts or unrelated digital products."
    },
    {
      icon: 'images/folder-open.png',
      title: 'POLICY CHANGE',
      subtitle: 'Outcome',
      description:
        'Policies, strategies, legal instruments, programs, budgets, or investments at different scales that have been modified in design or implementation.'
    },
    {
      icon: 'images/chart-pie.png',
      title: 'OICR',
      subtitle: 'Outcome',
      description:
        'An evidence-based report detailing any outcome or impact that has resulted from the work of one or more CGIAR programs, initiatives, or centers.'
    },
    {
      icon: 'images/medium-brightness.png',
      title: 'INNOVATIONS',
      subtitle: 'Outcome',
      description:
        'A metric used to assess the extent to which an innovation is already being used, by which type of users and under which conditions, with a scale ranging from no use (lowest level) to common use.'
    }
  ]);
}
