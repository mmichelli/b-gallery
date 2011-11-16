
(function($){

  var BoylstonGallery  = function(el, options) {
    var gallery = el,
    defaults = {
      index : 0,
      next : ".Navigation .next, .Navigation .nextslide",
      previous: ".Navigation .previous, .Navigation .previousslide",
      slides : ".slide",
      slideFX : slideSlide,
      bubbleFX : bubbleFade,
      buttonsSlideSpeed: 300,
      setHash : false,
      autoSlideInterval: 4000,
      autoSlide: true,
    },
    opts = $.extend(defaults, options),
    index = opts.index,
    oldIndex = index,
    next = $(opts.next, gallery),
    previous = $(opts.previous, gallery),
    slideFX = opts.slideFX,
    bubbleFX = opts.bubbleFX,
    self = this,
    direction = "",
    nextTick = 0,
    activeNoTicking = false;

    addMethods();
    this.jumpToHash();
    this.addClickEvents();
    updateCounter();

    tick();

    next.click(function() {
      direction = "right";
      incIndex(1);
      return false;
    });

    previous.click(function() {
      direction = "left";
      incIndex(-1);
      return false;
    });

    function addMethods(){
      self.addClickEvents = function()
      {
        $(".icon a.point:not(.c)" , gallery).addClass("c").click(clickPoint);
      }

      self.gotToSlide = function(slide) {
        var i = $(opts.slides, gallery).index(slide);
        if( -1 != i )
          setIndex(i);
      };

      self.getIndex = function() {
        var top = $(opts.slides, gallery).filter(".top");
        return $(opts.slides, gallery).index(top);
      };

      self.update = function() {
        update();
      }



      self.jumpToHash = function ()
      {

        if(gallery.attr("id") && window.location.hash.indexOf(gallery.attr("id")) != -1)
        {

          var id =  window.location.hash.split("_");
          if(id.length == 2  ) {
            var i = Number(id[1]);
            i = (isNaN(i))?0: Number(id[1]);
            setIndex(i - 1);
          }
        }
        else
        {
          setIndex(0);
        }
      };
    }

    function clearSlideTimeout()
    {
      window.clearTimeout(nextTick);
    }

    function tick(){
      if(opts.autoSlide) {
        console.log(".");
        clearSlideTimeout();
        nextTick = window.setTimeout(function() {
          var activePoints = $(".bubble:visible", gallery ).size();
          if( activePoints === 0 && !activeNoTicking) {
            direction = "right";
            incIndex(1);
          }
          else
          {
            tick();
          }


        }, opts.autoSlideInterval);
      }
    }

    function clickPoint()
    {
      var bubble =  $(this).parent();
      bubble.toggleClass("active");
      if(bubble.hasClass("active"))
      {
        closeOtherBubbles(bubble);
      }
      $(".slider" , gallery).css("overflow", "visible");
      bubbleFX();
      return false;
    }

    function closeOtherBubbles(bubble)
    {
      bubble.siblings().removeClass("active");
    }

    function closeBubbles()
    {
      $(".icon" , gallery).removeClass("active");
    }

    function updateSlider()
    {
      $(opts.slides, gallery).filter(".bottom").removeClass("bottom");
      $(opts.slides, gallery).filter(".top").removeClass("top").addClass("bottom");
      $($(opts.slides, gallery).get(index)).addClass("top").removeClass("bottom");
      $("#Caption",gallery).html("");
      $("#Caption",gallery).append($(".slide.top p.caption",gallery).clone());
      $("#SlideLink a",gallery).attr("href",$(".slide.top a:first").attr("href"));
      $("#SlideLink a",gallery).html($(".slide.top a:first").attr("href"));
    }

    function updateCounter()
    {
      var idd = doubleDigit(index + 1),
      sdd =  doubleDigit($(opts.slides, gallery).size());
      $(".count", gallery).html(idd+"/"+sdd);
    };

    gallery.mouseover(function(){
      activeNoTicking = true;
      $(".Navigation .next span", this).stop().animate({'margin-left': 0}, {duration:opts.buttonsSlideSpeed})
      $(".Navigation .previous span", this).stop().animate({'margin-left': 0}, {duration:opts.buttonsSlideSpeed})
    })

      .mouseout(function(){
        activeNoTicking = false;
        tick();
        $(".Navigation .previous span",this).stop().animate({'margin-left': -40}, {duration:opts.buttonsSlideSpeed});
        $(".Navigation .next span",this).stop().animate({'margin-left': 40}, {duration:opts.buttonsSlideSpeed})
      })


    function hideArrows()
    {
      if($(opts.slides, gallery).size() < 2) {
        next.hide();
        previous.hide();
        $(".count", gallery).hide();
      }
      else
      {
        next.show();
        previous.show();
        $(".count", gallery).show();
      }
    }

    function updateHash()
    {
      if(opts.setHash && gallery.attr("id"))
      {
        window.location.hash  = gallery.attr("id") + "_" +  (index + 1);
      }
    }

    function incIndex(inc)
    {
      closeBubbles();
      setIndex(self.getIndex() + inc);
      tick();

    }

    function update()
    {
      cleanIndex();
      updateHash();
      updateCounter();
      updateSlider();
      slideFX();
      captionFX();
      bubbleFX();
      hideArrows();
    }

    function cleanIndex()
    {
      index = (index) % $(opts.slides, gallery).size();
      index = (-1 == index)?$(opts.slides, gallery).size() - 1:index;
      index = Math.max(0, index);
    }

    function setIndex(i) {

      oldIndex = index;
      index = i;
      cleanIndex();
      closeBubbles();
      update();
    }

    function doubleDigit(n)
    {
      var s = n + 1000 + "";
      return s.substring(s.length -2, s.length );
    }

    function bubbleFade()
    {
      $(".icon" , gallery).filter(".active").children(".bubble:hidden").fadeIn(500);
      $(".icon" , gallery).not(".active").children(".bubble:visible").fadeOut(500);
    }

    function captionFX()
    {
      $("#Caption",gallery).hide();
      $("#Caption",gallery).clearQueue().fadeOut(500).delay(500).fadeIn(500);
    }

    function slideFade()
    {
      var top = $(opts.slides, gallery).filter(".top"),
      bottom = $(opts.slides, gallery).filter(".bottom");
      top.hide();
      top.fadeIn(500,afterAnimation);
    }
    function slideSlide()
    {
      var top = $(opts.slides, gallery).filter(".top"),
      bottom = $(opts.slides, gallery).filter(".bottom");


      bottom.show();
      top.show();

      $(".slider" , gallery).css("overflow", "hidden");

      if(direction == "right" )
      {
        top.clearQueue().css({left: top.width() });
        top.animate({left:0}, 500);
        bottom.clearQueue().css({left:0 }).animate({left: -bottom.width()}, 500, afterAnimation);
      }
      else if (direction == "left")
      {
        top.clearQueue().css({left: -top.width() });
        top.animate({left:0}, 500);
        bottom.clearQueue().css({left:0 }).animate({left: bottom.width()}, 500, afterAnimation);
      }
      else
      {
        top.css({left:0}).show();
        bottom.css({left:0}).hide();
        afterAnimation();
      }


    }
    function afterAnimation()
    {
      $(opts.slides, gallery).not(".top").css({left:0});

    }

  };



  $.fn.BoylstonGallery =  function(options) {
    var bgs = [];
    $(this).each(function() {
      bgs.push(new BoylstonGallery($(this), options));
    });
    if(bgs.length == 1)
      return bgs[0]
    else
      return  bgs;
  };

}
)(jQuery);
