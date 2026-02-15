import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { ArrowRight, Code, Sparkles, Zap, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import Navbar from '@/components/Navbar';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const Landing = () => {
  const [portfolioProjects, setPortfolioProjects] = useState([]);

  useEffect(() => {
    fetchPortfolio();
  }, []);

  const fetchPortfolio = async () => {
    try {
      const response = await axios.get(`${API}/projects/portfolio`);
      setPortfolioProjects(response.data);
    } catch (error) {
      console.error('Failed to fetch portfolio:', error);
    }
  };

  const services = [
    { icon: Code, title: 'Web Development', description: 'Custom websites built with modern technologies' },
    { icon: Sparkles, title: 'UI/UX Design', description: 'Beautiful, intuitive interfaces that users love' },
    { icon: Zap, title: 'Performance Optimization', description: 'Lightning-fast load times and smooth interactions' },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <section className="relative overflow-hidden py-24 md:py-32" data-testid="hero-section">
        <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 via-transparent to-transparent" />
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="max-w-3xl animate-fade-in">
            <h1 className="font-heading font-bold text-4xl md:text-6xl tracking-tight mb-6" data-testid="hero-title">
              Transform Your Vision Into
              <span className="block bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60">
                Digital Reality
              </span>
            </h1>
            <p className="text-lg text-muted-foreground mb-8" data-testid="hero-description">
              Professional web development services tailored to your needs. From concept to launch, 
              we bring your ideas to life with cutting-edge technology and stunning design.
            </p>
            <div className="flex gap-4">
              <Link to="/booking">
                <Button size="lg" className="glow-primary" data-testid="hero-cta-btn">
                  Start Your Project <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <a href="#portfolio">
                <Button size="lg" variant="outline" data-testid="hero-portfolio-btn">
                  View Portfolio
                </Button>
              </a>
            </div>
          </div>
        </div>
      </section>

      <section id="services" className="py-24 px-6" data-testid="services-section">
        <div className="max-w-7xl mx-auto">
          <h2 className="font-heading font-semibold text-3xl md:text-4xl text-center mb-12" data-testid="services-title">
            What We Offer
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {services.map((service, idx) => {
              const Icon = service.icon;
              return (
                <Card key={idx} className="p-8 stat-card glassmorphism" data-testid={`service-card-${idx}`}>
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    <Icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-heading font-semibold text-xl mb-2">{service.title}</h3>
                  <p className="text-muted-foreground">{service.description}</p>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      <section id="portfolio" className="py-24 px-6 bg-card/30" data-testid="portfolio-section">
        <div className="max-w-7xl mx-auto">
          <h2 className="font-heading font-semibold text-3xl md:text-4xl text-center mb-12" data-testid="portfolio-title">
            Featured Projects
          </h2>
          {portfolioProjects.length === 0 ? (
            <p className="text-center text-muted-foreground" data-testid="portfolio-empty">No portfolio projects yet.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {portfolioProjects.map((project) => (
                <Card key={project.id} className="overflow-hidden stat-card" data-testid={`portfolio-project-${project.id}`}>
                  <div className="aspect-video bg-gradient-to-br from-primary/20 to-secondary flex items-center justify-center">
                    <Code className="w-12 h-12 text-primary" />
                  </div>
                  <div className="p-6">
                    <h3 className="font-heading font-semibold text-xl mb-2">{project.title}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-2">{project.description}</p>
                    <div className="mt-4 flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-500" />
                      <span className="text-sm text-green-500">Completed</span>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="py-24 px-6" data-testid="cta-section">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="font-heading font-bold text-3xl md:text-5xl mb-6">
            Ready to Start Your Project?
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            Let's discuss your ideas and create something amazing together.
          </p>
          <Link to="/booking">
            <Button size="lg" className="glow-primary" data-testid="cta-booking-btn">
              Get Started Now <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </Link>
        </div>
      </section>

      <footer className="border-t border-border py-8 px-6">
        <div className="max-w-7xl mx-auto text-center text-sm text-muted-foreground">
          <p>© 2026 ClientFlow. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;