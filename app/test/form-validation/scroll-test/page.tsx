"use client";

import React from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function ScrollTest() {
  const [activeTab, setActiveTab] = React.useState('tab1');
  const [showTabs, setShowTabs] = React.useState(true);
  
  // Ref for the scroll container
  const scrollContainerRef = React.useRef<HTMLDivElement>(null);
  
  // State for scroll controls
  const [showLeftArrow, setShowLeftArrow] = React.useState(false);
  const [showRightArrow, setShowRightArrow] = React.useState(false);
  
  // Create lots of tabs to force scrolling
  const tabs = [
    { id: 'tab1', label: 'Personal Info' },
    { id: 'tab2', label: 'Address' },
    { id: 'tab3', label: 'Employment' },
    { id: 'tab4', label: 'Education' },
    { id: 'tab5', label: 'Preferences' },
    { id: 'tab6', label: 'Account' },
    { id: 'tab7', label: 'Social Media' },
    { id: 'tab8', label: 'Additional Info' },
    { id: 'tab9', label: 'Emergency Contact' },
    { id: 'tab10', label: 'Miscellaneous' },
    { id: 'tab11', label: 'Hobbies' },
    { id: 'tab12', label: 'Travel' },
    { id: 'tab13', label: 'Favorites' },
    { id: 'tab14', label: 'Health' },
    { id: 'tab15', label: 'Finance' },
  ];
  
  // Check if scrolling is needed
  const checkScrollability = React.useCallback(() => {
    const container = scrollContainerRef.current;
    if (!container) return;
    
    const isScrollable = container.scrollWidth > container.clientWidth;
    
    // Debug log
    console.log('Scroll debug:', {
      scrollWidth: container.scrollWidth,
      clientWidth: container.clientWidth,
      isScrollable,
      scrollLeft: container.scrollLeft,
      maxScroll: container.scrollWidth - container.clientWidth
    });
    
    setShowLeftArrow(isScrollable && container.scrollLeft > 0);
    setShowRightArrow(
      isScrollable && container.scrollLeft < container.scrollWidth - container.clientWidth - 2
    );
  }, []);
  
  // Scroll left
  const scrollLeft = React.useCallback(() => {
    const container = scrollContainerRef.current;
    if (!container) return;
    
    const scrollAmount = container.clientWidth * 0.5;
    container.scrollBy({
      left: -scrollAmount,
      behavior: 'smooth'
    });
    
    // Update arrow visibility after scrolling
    setTimeout(checkScrollability, 300);
  }, [checkScrollability]);
  
  // Scroll right
  const scrollRight = React.useCallback(() => {
    const container = scrollContainerRef.current;
    if (!container) return;
    
    const scrollAmount = container.clientWidth * 0.5;
    container.scrollBy({
      left: scrollAmount,
      behavior: 'smooth'
    });
    
    // Update arrow visibility after scrolling
    setTimeout(checkScrollability, 300);
  }, [checkScrollability]);
  
  // Effect to ensure active tab is visible
  React.useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;
    
    // Scroll to active tab when it changes
    setTimeout(() => {
      const activeTabElement = container.querySelector(`[data-value="${activeTab}"]`);
      if (activeTabElement) {
        // Get position information
        const containerRect = container.getBoundingClientRect();
        const tabRect = (activeTabElement as HTMLElement).getBoundingClientRect();
        
        // Check if active tab is outside visible area
        if (tabRect.left < containerRect.left || tabRect.right > containerRect.right) {
          // Calculate center position to scroll to
          const tabLeft = (activeTabElement as HTMLElement).offsetLeft;
          const centerPosition = tabLeft - (containerRect.width / 2) + (tabRect.width / 2);
          
          container.scrollTo({
            left: Math.max(0, centerPosition),
            behavior: 'smooth'
          });
        }
      }
      
      // Update arrow visibility
      checkScrollability();
    }, 100);
  }, [activeTab, checkScrollability]);
  
  // Add event listeners
  React.useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;
    
    // Initial check
    checkScrollability();
    
    // Handle scroll events
    const handleScroll = () => {
      const container = scrollContainerRef.current;
      if (!container) return;
      
      setShowLeftArrow(container.scrollLeft > 0);
      setShowRightArrow(
        container.scrollLeft < container.scrollWidth - container.clientWidth - 2
      );
    };
    
    // Handle resize events
    const handleResize = () => {
      checkScrollability();
    };
    
    container.addEventListener('scroll', handleScroll);
    window.addEventListener('resize', handleResize);
    
    return () => {
      container.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
    };
  }, [checkScrollability]);
  
  return (
    <div className="container py-10">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Tab Scroll Test</h1>
        
        <div className="flex items-center space-x-2">
          <Label htmlFor="show-tabs">Show Tabs</Label>
          <Switch
            id="show-tabs"
            checked={showTabs}
            onCheckedChange={setShowTabs}
          />
        </div>
      </div>
      
      <div className="mb-4 p-4 bg-muted rounded-lg">
        <p className="text-sm">
          This test page has 15 tabs to test the horizontal scrolling behavior. Toggle the switch to show/hide tabs.
        </p>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Tab Scrolling Test</CardTitle>
          <CardDescription>Testing the scrolling behavior with many tabs</CardDescription>
        </CardHeader>
        
        <CardContent>
          {showTabs ? (
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <div className="relative mb-6">
                {/* Left scroll control */}
                {showLeftArrow && (
                  <Button
                    variant="outline"
                    size="icon"
                    className="absolute left-0 top-1/2 z-10 h-7 w-7 -translate-y-1/2 rounded-full"
                    onClick={scrollLeft}
                  >
                    <ChevronLeft className="h-4 w-4" />
                    <span className="sr-only">Scroll left</span>
                  </Button>
                )}
                
                {/* Tab list with horizontal scrolling */}
                <div 
                  ref={scrollContainerRef}
                  className="scrollbar-hide relative flex overflow-x-auto overflow-y-hidden px-8"
                >
                  <TabsList className="h-10 bg-transparent flex w-max">
                    {tabs.map((tab) => (
                      <TabsTrigger
                        key={tab.id}
                        value={tab.id}
                        data-value={tab.id}
                        className="relative px-4 whitespace-nowrap"
                      >
                        {tab.label}
                        {tab.id === 'tab3' && (
                          <Badge className="ml-2 bg-red-500 text-white">3</Badge>
                        )}
                      </TabsTrigger>
                    ))}
                  </TabsList>
                </div>
                
                {/* Right scroll control */}
                {showRightArrow && (
                  <Button
                    variant="outline"
                    size="icon"
                    className="absolute right-0 top-1/2 z-10 h-7 w-7 -translate-y-1/2 rounded-full"
                    onClick={scrollRight}
                  >
                    <ChevronRight className="h-4 w-4" />
                    <span className="sr-only">Scroll right</span>
                  </Button>
                )}
              </div>
              
              {/* Tab content */}
              {tabs.map((tab) => (
                <TabsContent key={tab.id} value={tab.id} className="space-y-4">
                  <h3 className="text-lg font-medium">{tab.label} Content</h3>
                  <p>This is the content for the {tab.label} tab.</p>
                  <div className="h-40 border rounded-md flex items-center justify-center bg-muted/30">
                    Content for {tab.label}
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          ) : (
            <div className="space-y-8">
              {tabs.map((tab) => (
                <div key={tab.id} className="pb-6 border-b last:border-0">
                  <h3 className="text-lg font-medium mb-4">{tab.label}</h3>
                  <div className="h-40 border rounded-md flex items-center justify-center bg-muted/30">
                    Content for {tab.label}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
      
      <div className="mt-8 pt-6 border-t">
        <Button 
          variant="outline" 
          onClick={() => window.history.back()}
        >
          Back to Tests
        </Button>
      </div>
    </div>
  );
} 