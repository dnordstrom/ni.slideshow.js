/**
 * NI.Slideshow.js, version 0.1
 * (c) 2011 Daniel Nordstrom, Nintera(ctive)
 *
 * Image slideshow classes for Prototype.js. Concept originally based on
 * http://blog.casanovawebdesign.com/2009/06/simple-prototypejs-slideshow/
 * but has since been rewritten.
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 * 
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

var oldNI = { };
if(NI !== undefined) {
  oldNI = NI;
}

var NI = new function() {
  this.SlideshowConfig = Class.create({
    initialize: function(options) {
      this.defaultOptions = Object.clone(NI.SlideshowConfig.defaultOptions);
      
      if(typeof(options) === 'object') {
        this.options = options;
      }
      else {
        this.options = { };
      }
      this.mergeDefaults();
    },
    
    mergeDefaults: function() {
      this.options = Object.extend(this.defaultOptions, this.options);
    },
    
    getOption: function(option) {
      return this.options[option];
    }
  });
  
  Object.extend(this.SlideshowConfig, {
    defaultOptions: {
      slideDuration: 5,
      transitionDuration: 2,
      nextButton: '',
      previousButton: '',
      pauseOnMouseover: false
    },
    
    // Lets users of the class add their own defaults to all slideshows.
    // Takes options in object literal notation as argument.
    addDefaults: function(options) {
      NI.SlideshowConfig.defaultOptions = Object.extend(NI.SlideshowConfig.defaultOptions, options);
    }
  });
  
  this.Slideshow = Class.create({
    initialize: function(containerElement, options) {
      this.slideshowContainer = containerElement;
      this.slides = [];
      this.config = new NI.SlideshowConfig(options);
      this.timer = 0;
      
      this.setStateTo(NI.Slideshow.NOT_STARTED);
      this.updateSlideshow();
    },
    
    updateSlideshow: function() {
      var childElements = $(this.slideshowContainer).childElements();
      this.slides = this.getValidSlides(childElements);
      
      this.updateSlideshowDuration();
    },
    
    getValidSlides: function(slideElements) {
      var validSlides = [];
      for(index = 0; index < slideElements.length; index++) {
        var slideElement = new NI.Slide(slideElements[index]);
        validSlides.push(slideElement);
      }
      return validSlides;
    },
    
    updateSlideshowDuration: function() {
      this.slideshowDuration = this.config.getOption("slideDuration") * this.slides.size();
    },
    
    start: function() {
      this.hideSlides();
      
      NI.SlideshowContainer.addSlideshow(this);
      
      NI.SlideshowTimerHandler.startTimers();
      this.setStateTo(NI.Slideshow.STARTED);
      
      this.eventHandler = new NI.SlideshowEventHandler(this);
    },
    
    hideSlides: function() {
      this.slides.each(function(slide) {
        slide.toggle();
        slide.visible = false;
      });
    },
    
    getOption: function(option) {
      return this.config.getOption(option);
    },
    
    getElementId: function() {
      return this.slideshowContainer;
    },
    
    isStopped: function() {
      return (this.state === NI.Slideshow.STOPPED);
    },
    
    isRunning: function() {
      return (!this.isPaused() && !this.isStopped());
    },
    
    isPaused: function() {
      return (this.state === NI.Slideshow.PAUSED);
    },
    
    isNotStarted: function() {
      return (this.state === NI.Slideshow.NOT_STARTED);
    },
    
    isNotRunning: function() {
      return (this.isPaused() || this.isStopped());
    },
    
    setStateTo: function(state) {
      this.state = state;
    },
    
    goToNextSlide: function() {
      var slideshow = this;
      this.slides.each(function(slide, index) {
        if(slideshow.isStopped() && slide.isVisible() && slide.isNotAnimating()) {
          slideshow.showNextWhileAnimating(index);
        }
        else if(slideshow.isRunning() && slide.isVisible()) {
          slideshow.showNextWhileNotAnimating(index);
        }
      });
    },
    
    showNextWhileAnimating: function(index) {
      this.slides[index].disappear();
      if(this.slides[index + 1] !== undefined) {
        this.slides[index + 1].appear();
      }
      else {
        this.slides[0].appear();
      }
    },
    
    showNextWhileNotAnimating: function(index) {
      this.slides[index + 1].disappear();
      if(this.slides[index + 1] !== undefined) {
        this.slides[index + 1].appear();
      }
      else {
        this.slides[0].appear();
      }
    },
    
    goToPreviousSlide: function() {
      var slideshow = this;
      this.slides.each(function(slide, index) {
        if(slideshow.isStopped() && slide.isVisible() && slide.isNotAnimating()) {
          slideshow.showPreviousWhileAnimating(index);
        }
        else if(slideshow.isRunning() && slide.isVisible()) {
          slideshow.showPreviousWhileNotAnimating(index);
        }
      });
    },
    
    showPreviousWhileAnimating: function(index) {
      this.slides[index].disappear();
      if(this.slides[index - 1] !== undefined) {
        this.slides[index - 1].appear();
      }
      else {
        this.slides[this.slides.size() - 1].appear();
      }
    },
    
    showPreviousWhileNotAnimating: function(index) {
      this.slides[index].disappear();
      if(this.slides[index - 1] !== undefined) {
        this.slides[index - 1].appear();
      }
      else {
        this.slides[this.slides.size() - 1].appear();
      }
    },
    
    orderSlidesByVisibility: function() {
      var visibleSlideIndex = 0;
      this.slides.each(function(slide, index) {
        if(slide.isVisible()) {
          visibleSlideIndex = index;
        }
      });
      
      // Shift hidden slides from beginning of array to get visible slide first
      for(index = 0; index < visibleSlideIndex; index++) {
        var slide = this.slides.shift();
        this.slides.push(slide);
      }
    }
  });
  
  this.SlideshowStates = {
    STOPPED: 0,
    PAUSED: 1,
    STARTED: 2,
    NOT_STARTED: 3
  };
  
  Object.extend(this.Slideshow, this.SlideshowStates);
  
  this.Slide = Class.create({
    initialize: function(slideElement) {
      this.element = slideElement;
      this.appearTimer = 0;
      this.disappearTimer = 0;
    },
    
    toggle: function() {
      this.element.toggle();
    },
    
    appear: function(options) {
      this.element.appear(options);
    },
    
    disappear: function(options) {
      this.element.fade(options);
    },
    
    isVisible: function() {
      return this.element.visible();
    },
    
    isNotAnimating: function() {
      return (this.element.getStyle("opacity") === 1 || this.element.getStyle("opacity") === 0);
    }
  });
  
  this.SlideshowEventHandler = Class.create({
    initialize: function(slideshow) {
      this.slideshow = slideshow;
      this.loadDefaultEvents();
      
      var eventHandler = this;
      NI.SlideshowEventHandler.events.each(function(event) {
        if(event.slideshow === slideshow.slideshowContainer) {
          eventHandler.setUpEvent(event, slideshow);
        }
      });
    },
    
    loadDefaultEvents: function() {
      NI.SlideshowEventHandler.addEvent(new NI.SlideshowNextEvent(this.slideshow));
      NI.SlideshowEventHandler.addEvent(new NI.SlideshowPreviousEvent(this.slideshow));
      NI.SlideshowEventHandler.addEvent(new NI.SlideshowMouseoverEvent(this.slideshow));
      NI.SlideshowEventHandler.addEvent(new NI.SlideshowMouseoutEvent(this.slideshow));
    },
    
    setUpEvent: function(event, slideshow) {
      if(event.bind) {
        event.bind(slideshow);
      }

      $(slideshow.getElementId()).observe(event.eventName, function() {
        event.action(slideshow);
      });
    }
  });
  
  Object.extend(this.SlideshowEventHandler, {
    events: [],
    
    addEvent: function(newEvent) {
      NI.SlideshowEventHandler.events.push(newEvent);
    }
  });
  
  this.SlideshowNextEvent = Class.create({
    initialize: function(slideshow) {
      this.eventName = "ni:slideshow:next";
      this.slideshow = slideshow.slideshowContainer;
    },
    
    action: function(slideshow) {
      NI.SlideshowTimerHandler.stopTimers(slideshow);
      slideshow.setStateTo(NI.Slideshow.STOPPED);
      slideshow.goToNextSlide();
    },
    
    bind: function(slideshow) {
      var nextButton = slideshow.getOption("nextButton");
      var name = this.eventName;
      
      if($(nextButton) !== null) {
        $(nextButton).observe('click', function(event) {
          $(slideshow.slideshowContainer).fire(name);
          event.stop();
        });
      }
    }
  });
  
  this.SlideshowPreviousEvent = Class.create({
    initialize: function(slideshow) {
      this.eventName = "ni:slideshow:previous";
      this.slideshow = slideshow.slideshowContainer;
    },
    
    action: function(slideshow) {
      NI.SlideshowTimerHandler.stopTimers(slideshow);
      slideshow.setStateTo(NI.Slideshow.STOPPED);
      slideshow.goToPreviousSlide();
    },
    
    bind: function(slideshow) {
      var previousButton = slideshow.getOption("previousButton");
      var name = this.eventName;

      if($(previousButton) !== null) {
        $(previousButton).observe('click', function(event) {
          $(slideshow.slideshowContainer).fire(name);
          event.stop();
        });
      }
    }
  });
  
  this.SlideshowMouseoverEvent = Class.create({
    initialize: function(slideshow) {
      this.eventName = "ni:slideshow:mouseover";
      this.slideshow = slideshow.slideshowContainer;
    },

    action: function(slideshow) {
      if(slideshow.isRunning()) {
        NI.SlideshowTimerHandler.stopTimers(slideshow);
        slideshow.setStateTo(NI.Slideshow.PAUSED);
      }
    },

    bind: function(slideshow) {
      var mouseover = slideshow.getOption("pauseOnMouseover");
      var name = this.eventName;

      if(mouseover) {
        $(slideshow.getElementId()).observe('mouseover', function(event) {
          $(slideshow.getElementId()).fire(name);
        });
      }
    }
  });
  
  this.SlideshowMouseoutEvent = Class.create({
    initialize: function(slideshow) {
      this.eventName = "ni:slideshow:mouseout";
      this.slideshow = slideshow.slideshowContainer;
    },

    action: function(slideshow) {
      var pauseOnMouseover = slideshow.getOption("pauseOnMouseover");
      var name = this.eventName;

      if(pauseOnMouseover && slideshow.isPaused()) {
        NI.SlideshowTimerHandler.startTimers(slideshow);
        slideshow.setStateTo(NI.Slideshow.STARTED);
      }
    },

    bind: function(slideshow) {
      var pauseOnMouseover = slideshow.getOption("pauseOnMouseover");
      var name = this.eventName;

      if(pauseOnMouseover) {
        $(slideshow.getElementId()).observe('mouseout', function(event) {
          $(slideshow.getElementId()).fire(name);
        });
      }
    }
  });
  
  this.SlideshowTimerHandler = Class.create({
    initialize: function(slideshow) {
      NI.SlideshowTimerHandler.slideshow = slideshow;
    }
  });
  
  Object.extend(this.SlideshowTimerHandler, {
    startTimers: function(slideshow) {
      if(slideshow === undefined) {
        NI.SlideshowTimerHandler.setAllTimers();
      }
      else if(slideshow.isPaused()) {
        slideshow.orderSlidesByVisibility();
        NI.SlideshowTimerHandler.setSlideshowTimers(slideshow);
      }
    },
    
    setSlideshowTimers: function(slideshow) {
      var duration = slideshow.slideshowDuration * 1000;
      
      NI.SlideshowTimerHandler.setSlideTimers(slideshow.getElementId());
      slideshow.timer = setInterval("NI.SlideshowTimerHandler.setSlideTimers('" + slideshow.getElementId() + "')", duration);
    },
    
    setSlideTimers: function(slideshowId) {
      var slideshow = NI.SlideshowContainer.getSlideshowById(slideshowId);
      
      slideshow.slides.each(function(slide, index) {
        NI.SlideshowTimerHandler.setAppearTimer(slideshow, index);
        NI.SlideshowTimerHandler.setDisappearTimer(slideshow, index);
      });
    },
    
    setAppearTimer: function(slideshow, index) {
      var duration = index * ((slideshow.getOption("slideDuration") * 1000));
      slideshow.slides[index].appearTimer = setTimeout(function(){
        slideshow.slides[index].appear({ duration: slideshow.getOption("transitionDuration") });
      }, duration);
    },
    
    setDisappearTimer: function(slideshow, index) {
      duration = ((index + 1) * ((slideshow.getOption("slideDuration") * 1000) - slideshow.getOption("slideDuration")));
      slideshow.slides[index].disappearTimer = setTimeout(function(){
        slideshow.slides[index].disappear({ duration: slideshow.getOption("transitionDuration") });
      }, duration);
    },
    
    setAllTimers: function() {
      var slideshows = NI.SlideshowContainer.getSlideshows();

      for(index = 0; index < slideshows.length; index++) {
        var slideshow = slideshows[index];
        
        if(slideshow.isNotStarted()) {
          NI.SlideshowTimerHandler.setSlideshowTimers(slideshow);
        }
      }
    },
    
    stopTimers: function(slideshow) {
      slideshow.slides.each(function(slide) {
        clearTimeout(slide.appearTimer);
        clearTimeout(slide.disappearTimer);
      });
      clearInterval(slideshow.timer);;
    }
  });
  
  this.SlideshowContainer = Class.create({
  });
  
  Object.extend(this.SlideshowContainer, {
    slideshows: [],
    
    addSlideshow: function(slideshow) {
      if(typeof(slideshow) !== undefined) {
        NI.SlideshowContainer.slideshows.push(slideshow);
      }
    },
    
    getSlideshows: function() {
      return NI.SlideshowContainer.slideshows;
    },
    
    getSlideshowById: function(containerId) {
      var slideshows = NI.SlideshowContainer.getSlideshows();

      for(index = 0; index < slideshows.length; index++) {
        if(slideshows[index].getElementId() == containerId) {
          return slideshows[index];
        }
      }
    }
  });
};

if(oldNI !== { }) {
  NI = Object.extend(oldNI, NI);
}