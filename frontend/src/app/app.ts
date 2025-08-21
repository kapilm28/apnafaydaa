import { Component, AfterViewInit } from '@angular/core';
import $ from 'jquery';
import { Footer } from './footer/footer';
import { Header } from './header/header';
import { RouterOutlet } from '@angular/router';

// WOW.js & Lightbox are loaded globally via angular.json scripts
declare const WOW: any;
declare const lightbox: any;

/**
 * Minimal jQuery plugin typings so TS is happy.
 * If you already created separate .d.ts files, you can delete this block.
 */
declare global {
  interface JQuery {
    owlCarousel(options?: OwlCarouselOptions): JQuery;
    counterUp(options?: { delay?: number; time?: number }): JQuery;
  }
  interface OwlCarouselOptions {
    items?: number;
    margin?: number;
    loop?: boolean;
    center?: boolean;
    mouseDrag?: boolean;
    touchDrag?: boolean;
    pullDrag?: boolean;
    freeDrag?: boolean;
    stagePadding?: number;
    merge?: boolean;
    mergeFit?: boolean;
    autoWidth?: boolean;
    startPosition?: number | string;
    rtl?: boolean;
    smartSpeed?: number;
    fluidSpeed?: number;
    dragEndSpeed?: number;
    responsive?: { [breakpoint: number]: OwlCarouselOptions };
    responsiveRefreshRate?: number;
    responsiveBaseElement?: any;
    fallbackEasing?: string;

    // Navigation
    nav?: boolean;
    navText?: [string, string];
    navSpeed?: number | boolean;
    navElement?: string;
    navContainer?: string | boolean;
    navContainerClass?: string;
    navClass?: [string, string];

    // Dots
    dots?: boolean;
    dotsEach?: number | boolean;
    dotsData?: boolean;
    dotsSpeed?: number | boolean;
    dotsContainer?: string | boolean;

    // Autoplay
    autoplay?: boolean;
    autoplayTimeout?: number;
    autoplayHoverPause?: boolean;
    autoplaySpeed?: number | boolean;

    // Effects
    animateOut?: string;
    animateIn?: string;
  }
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet,Header,Footer],
  templateUrl: './app.html'
})
export class App implements AfterViewInit {
  ngAfterViewInit(): void {
    // Ensure DOM is ready (Angular has rendered)
    $(async () => {
      this.hideSpinner();
      this.initWOW();
      this.initStickyNavbar();
      this.initHeaderCarousel();
      this.initTestimonialCarousel();
      this.initCounters();
      this.initBackToTop();
      this.initLightbox();
    });
  }

  private hideSpinner(): void {
    const spinner = document.getElementById('spinner');
    if (spinner) spinner.classList.remove('show');
  }

  private initWOW(): void {
    if (typeof WOW !== 'undefined') {
      new WOW().init();
    }
  }

  private initStickyNavbar(): void {
    $(window).on('scroll', function () {
      if ($(this).scrollTop()! > 45) {
        $('.nav-bar').addClass('sticky-top shadow-sm').css('top', '0px');
      } else {
        $('.nav-bar').removeClass('sticky-top shadow-sm').css('top', '-100px');
      }
    });
    // Trigger once for initial position
    $(window).trigger('scroll');
  }

  private initHeaderCarousel(): void {
    const $el = $('.header-carousel');
    if ($el.length && typeof ($el as any).owlCarousel === 'function') {
      $el.owlCarousel({
        animateOut: 'fadeOut',
        items: 1,
        margin: 0,
        stagePadding: 0,
        autoplay: true,
        smartSpeed: 500,
        dots: true,
        loop: true,
        nav: true,
        navText: [
          '<i class="bi bi-arrow-left"></i>',
          '<i class="bi bi-arrow-right"></i>'
        ]
      });
    }
  }

  private initTestimonialCarousel(): void {
    const $el = $('.testimonial-carousel');
    if ($el.length && typeof ($el as any).owlCarousel === 'function') {
      $el.owlCarousel({
        autoplay: true,
        smartSpeed: 1500,
        center: false,
        dots: false,
        loop: true,
        margin: 25,
        nav: true,
        navText: [
          '<i class="fa fa-arrow-right"></i>',
          '<i class="fa fa-arrow-left"></i>'
        ],
        responsive: {
          0: { items: 1 },
          576: { items: 1 },
          768: { items: 2 },
          992: { items: 2 },
          1200: { items: 2 }
        }
      });
    }
  }

  private initCounters(): void {
    const $counters = $('[data-toggle="counter-up"]');
    // counterUp depends on waypoints; both are loaded globally via angular.json
    if ($counters.length && typeof ($counters as any).counterUp === 'function') {
      $counters.counterUp({ delay: 5, time: 2000 });
    }
  }

  private initBackToTop(): void {
    $(window).on('scroll', function () {
      if ($(this).scrollTop()! > 300) {
        $('.back-to-top').fadeIn('slow');
      } else {
        $('.back-to-top').fadeOut('slow');
      }
    });

    $('.back-to-top').on('click', function (e) {
      e.preventDefault();
      $('html, body').animate({ scrollTop: 0 }, 1500, 'easeInOutExpo');
      return false;
    });
  }

  private initLightbox(): void {
    if (typeof lightbox !== 'undefined' && lightbox?.option) {
      lightbox.option({
        fadeDuration: 200,
        resizeDuration: 200,
        wrapAround: true
      });
    }
  }
}
