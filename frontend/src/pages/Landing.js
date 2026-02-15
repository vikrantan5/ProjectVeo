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
      
      {/* Modern Hero Section */}
      <section className="relative overflow-hidden py-16 sm:py-24 md:py-32 lg:py-40" data-testid="hero-section">
        <div className="absolute inset-0 hero-gradient" />
        <div className="absolute inset-0 grid-pattern" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-4xl mx-auto text-center animate-fade-in">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6 sm:mb-8">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-primary">Modern Web Solutions</span>
            </div>
            <h1 className="font-heading font-bold text-3xl sm:text-4xl md:text-5xl lg:text-7xl tracking-tight mb-4 sm:mb-6 leading-tight" data-testid="hero-title">
              Transform Your Vision Into
              <span className="block gradient-text mt-2">
                Digital Reality
              </span>
            </h1>
            <p className="text-base sm:text-lg lg:text-xl text-muted-foreground mb-8 sm:mb-10 max-w-2xl mx-auto px-4" data-testid="hero-description">
              Professional web development services tailored to your needs. From concept to launch, 
              we bring your ideas to life with cutting-edge technology and stunning design.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center px-4">
              <Link to="/booking" className="w-full sm:w-auto">
                <Button size="lg" className="glow-primary w-full sm:w-auto text-base sm:text-lg px-6 sm:px-8 py-5 sm:py-6" data-testid="hero-cta-btn">
                  Start Your Project <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <a href="#portfolio" className="w-full sm:w-auto">
                <Button size="lg" variant="outline" className="w-full sm:w-auto text-base sm:text-lg px-6 sm:px-8 py-5 sm:py-6 border-2" data-testid="hero-portfolio-btn">
                  View Portfolio
                </Button>
              </a>
            </div>
          </div>
        </div>
        
        {/* Floating Elements */}
        <div className="absolute top-20 left-10 w-20 h-20 bg-primary/10 rounded-full blur-3xl animate-float hidden lg:block" />
        <div className="absolute bottom-20 right-10 w-32 h-32 bg-accent/10 rounded-full blur-3xl animate-float hidden lg:block" style={{animationDelay: '2s'}} />
      </section>

      {/* Modern Services Section */}
      <section id="services" className="py-16 sm:py-20 md:py-24 px-4 sm:px-6 lg:px-8" data-testid="services-section">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="font-heading font-bold text-3xl sm:text-4xl md:text-5xl mb-4" data-testid="services-title">
              What We Offer
            </h2>
            <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
              Comprehensive solutions for your digital needs
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
            {services.map((service, idx) => {
              const Icon = service.icon;
              return (
                <Card key={idx} className="p-6 sm:p-8 stat-card glassmorphism group" data-testid={`service-card-${idx}`}>
                  <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center mb-4 sm:mb-6 group-hover:scale-110 transition-transform duration-300">
                    <Icon className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
                  </div>
                  <h3 className="font-heading font-bold text-xl sm:text-2xl mb-2 sm:mb-3">{service.title}</h3>
                  <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">{service.description}</p>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Modern Portfolio Section */}
      <section id="portfolio" className="py-16 sm:py-20 md:py-24 px-4 sm:px-6 lg:px-8 bg-card/30" data-testid="portfolio-section">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="font-heading font-bold text-3xl sm:text-4xl md:text-5xl mb-4" data-testid="portfolio-title">
              Featured Projects
            </h2>
            <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
              Explore our latest work and success stories
            </p>
          </div>
          {portfolioProjects.length === 0 ? (
            <div className="text-center py-12 sm:py-16">
              <div className="w-20 h-20 sm:w-24 sm:h-24 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
                <Code className="w-10 h-10 sm:w-12 sm:h-12 text-muted-foreground" />
              </div>
              <p className="text-base sm:text-lg text-muted-foreground" data-testid="portfolio-empty">No portfolio projects yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
              {portfolioProjects.map((project) => (
                <Card key={project.id} className="overflow-hidden stat-card group" data-testid={`portfolio-project-${project.id}`}>
                  <div className="aspect-video bg-gradient-to-br from-primary/30 via-accent/20 to-secondary relative overflow-hidden">
                    <div className="absolute inset-0 flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                      <Code className="w-12 h-12 sm:w-16 sm:h-16 text-white/80" />
                    </div>
                  </div>
                  <div className="p-5 sm:p-6">
                    <h3 className="font-heading font-bold text-lg sm:text-xl mb-2 group-hover:text-primary transition-colors">{project.title}</h3>
                    <p className="text-sm sm:text-base text-muted-foreground line-clamp-2 mb-4">{project.description}</p>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                      <span className="text-xs sm:text-sm font-medium text-green-500">Completed</span>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Modern CTA Section */}
      <section className="py-16 sm:py-20 md:py-24 px-4 sm:px-6 lg:px-8" data-testid="cta-section">
        <div className="max-w-4xl mx-auto">
          <Card className="p-8 sm:p-12 md:p-16 text-center glassmorphism relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-accent/10" />
            <div className="relative z-10">
              <h2 className="font-heading font-bold text-3xl sm:text-4xl md:text-5xl mb-4 sm:mb-6">
                Ready to Start Your Project?
              </h2>
              <p className="text-base sm:text-lg lg:text-xl text-muted-foreground mb-8 sm:mb-10 max-w-2xl mx-auto">
                Let's discuss your ideas and create something amazing together.
              </p>
              <Link to="/booking">
                <Button size="lg" className="glow-primary text-base sm:text-lg px-6 sm:px-8 py-5 sm:py-6" data-testid="cta-booking-btn">
                  Get Started Now <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
            </div>
          </Card>
        </div>
      </section>

      {/* Modern Footer */}
      <footer className="border-t border-border py-8 sm:py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-center sm:text-left">
              <p className="font-heading font-bold text-lg sm:text-xl mb-1">ProjectVeo</p>
              <p className="text-xs sm:text-sm text-muted-foreground">Transforming visions into reality</p>
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground text-center">
              © 2026 ProjectVeo. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;