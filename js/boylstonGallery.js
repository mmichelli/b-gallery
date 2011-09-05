
(function($){

  var BoylstonGallery  = function(el, options) {


    var gallery = el,
    defaults = {
      index : 0,
      next : ".Navigation .next, .Navigation .nextslide",
      previous: ".Navigation .previous, .Navigation .previousslide",
      slides : ".slide",
      slideFX : slideSlide,
      bubbleFX : bubbleFade
    },
    opts = $.extend(defaults, options),
    index = opts.index,
    oldIndex = index,
    next = $(opts.next, gallery),
    previous = $(opts.previous, gallery),
    slideFX = opts.slideFX,
    bubbleFX = opts.bubbleFX,
    self = this,
    direction= "";

    addMethods();
    this.jumpToHash();
    this.addClickEvents();
    updateCounter();

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
          setIndex(1);
        }
      };


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
      $(".icon" , gallery).siblings().removeClass("active");

    }

    function update()
    {

      updateCounter();
      updateHash();
      updateSlider();
      slideFX();
      bubbleFX();

    }

    function updateSlider()
    {
      $(opts.slides, gallery).filter(".bottom").removeClass("bottom");
      $(opts.slides, gallery).filter(".top").removeClass("top").addClass("bottom");
      $($(opts.slides, gallery).get(index)).addClass("top").removeClass("bottom");
    }

    function updateCounter()
    {
      var idd = doubleDigit(index + 1),
      sdd =  doubleDigit($(opts.slides, gallery).size());
      $(".count", gallery).html(idd+"/"+sdd);

    }



    function updateHash()
    {
      window.location.hash  = gallery.attr("id") + "_" +  (index + 1);
    }

    function incIndex(inc)
    {
      var i = self.getIndex();

      i = (i + inc) % $(opts.slides, gallery).size();
      i = (-1 == i)?$(opts.slides, gallery).size() - 1:i;
      closeBubbles();
      setIndex(i);

    }



    function setIndex(i) {
      oldIndex = index;
      index = i;
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
    return new BoylstonGallery(this, options);
  };

}
)(jQuery);











