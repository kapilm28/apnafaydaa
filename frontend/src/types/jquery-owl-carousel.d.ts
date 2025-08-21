declare global {
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
    info?: Function;
    nestedItemSelector?: string;
    itemElement?: string;
    stageElement?: string;
    refreshClass?: string;
    loadedClass?: string;
    loadingClass?: string;
    rtlClass?: string;
    responsiveClass?: string;
    dragClass?: string;
    grabClass?: string;

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

    // Lazy Load
    lazyLoad?: boolean;
    lazyContent?: boolean;

    // Video
    video?: boolean;
    videoHeight?: number | boolean;
    videoWidth?: number | boolean;
    animateOut?: string;
    animateIn?: string;

    // Callbacks
    onInitialize?: Function;
    onInitialized?: Function;
    onResize?: Function;
    onResized?: Function;
    onRefresh?: Function;
    onRefreshed?: Function;
    onDrag?: Function;
    onDragged?: Function;
    onTranslate?: Function;
    onTranslated?: Function;
    onChange?: Function;
    onChanged?: Function;
  }

  interface JQuery {
    owlCarousel(options?: OwlCarouselOptions): JQuery;
    trigger(eventName: string, params?: any[]): JQuery;
  }
}

export {};