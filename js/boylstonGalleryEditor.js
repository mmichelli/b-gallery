$(function() {


//---------------- Icons

  window.Icon = Backbone.Model.extend({
    defaults: function() {
      return { title: "Title", top: "100px", left:"100px", body:"Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Pellentesque in tellus. In pharetra consequat augue.", direction:""};}
  });



  window.Icons = Backbone.Collection.extend({
    model: Icon,

    initialize: function() {

      this.bind('all', this.change, this);
    },

    change: function() {
      window.Slides.trigger('change');
    },

  });


  window.IconView = Backbone.View.extend({
    tagName: "div",
    className: "icon",
    middle: 360,
    template: _.template($('#icon-template').html()),
    popupTemplate: _.template($("#epopup-template").html()),
    initialize: function() {
      this.model.bind('change', this.render, this);
      this.model.bind('destroy', this.remove, this);
    },

    editBubble: function(){
      var that = this;
      if(this.$(".bubble").hasClass("editing"))
      {
        return false;
      }
      this.$(".bubble").addClass("editing").html(this.popupTemplate(this.model.toJSON()));

      this.$(".bubble input[name='save']").click(function(){
        that.saveBubble();
      });
      this.$(".bubble input[name='cancel']").click(function(){
        that.render();
      });
      this.$(".bubble input[name='delete']").click(function(){
        that.model.destroy();
      });
    },

    saveBubble: function(){
      var title = this.$(".bubble input[name='title']").val(),
      body = this.$(".bubble textarea[name='body']").val();
      this.model.set({title:title, body:body}).save();
    },

    remove: function() {
      $(this.el).remove();
    },

    render: function() {

      $(this.el).html(this.template(this.model.toJSON()));

      if("top" == this.model.get("direction"))
        $(this.el).addClass("top");
      else
        $(this.el).removeClass("top");

      this.reposition();
      var that = this;
      $(this.el).css("position", "absolute");
      $(this.el).draggable({  opacity: 0.5,  stop: function(event, ui){
        that.model.set({top:ui.position.top, left:ui.position.left}).save();
        if(ui.offset.top < that.middle)
          that.model.set({direction: "bottom"});
        else
          that.model.set({direction: "top"});

      }});

      this.$(".bubble").dblclick(function(){
        that.editBubble();
      });

      $(that.el).removeClass("active");
      window.gallery.addClickEvents();
      return this;
    },

    reposition: function(){

      $(this.el).css("top",this.model.get("top"));
      $(this.el).css("left",this.model.get("left"));

    }

  });


//---------------- Background Images

  window.SlideImage = Backbone.Model.extend({
    defaults: function() {
      return { name: "", url: "images/2.png" };}
  });

  window.SlideImages = Backbone.Collection.extend({
    model: SlideImage,
    localStorage: new Store("images")
  });


 window.ImageThumb = Backbone.View.extend({
    tagName: "img",
    events: {
      "click": "updateImageSRC",
       "dblclick": "destroy"
    },

    updateImageSRC: function(){
      Slides.setCurrentSlide({url:this.model.get("url")});

    },

   destroy: function() {
     this.model.destroy();
   },

    initialize: function() {
      this.model.bind('change', this.render, this);
      this.model.bind('destroy', this.remove, this);
    },

    remove: function() {
      $(this.el).remove();
    },

    render: function() {
      $(this.el).attr("src", this.model.get("url"));
      return this;
    }

  });


  window.SlideImagesView = Backbone.View.extend({
    el: $("#dropbox"),
    path:"data/",

    addImages: function(file) {
      this.images.create({name:file.name, url:this.path+file.name});
    },

    initialize: function() {
      this.images = new SlideImages();
      this.images.bind('reset', this.addAll, this);
      this.images.bind('add', this.addImage, this);
      this.addDrop();
      this.images.fetch();
    },

    addImage: function(image) {
      var thumb = new ImageThumb({model:image});
      $(this.el).append(thumb.render().el);
    },

    addAll: function(img) {
      var self = this;
      this.images.each(function(img) {
        self.addImage(img);
      });
    },

    addDrop: function() {
      var self = this;
      new uploader('dropbox', 'uploader.php', null, function(percentage, file) {

        if(percentage == 100) {

          _.delay(function() {
            self.addImages(file);
          }, 1000);

        }


      });
    }


  });

//---------------- Slides

  window.Slide = Backbone.Model.extend({

    hasStoredIcons: false,
    initialize: function() {
      this.set({"icons": new Icons(this.get("icons"))});

    },

    defaults: function() {
      return { url:"images/1.png", title: "Title", icons: new Icons() , LinkURL: "", txt:"Lorem ipsum dolor sit amet, consectetuer adipiscing elit." };
    }
    ,
    newIcon: function()
    {
      this.get("icons").create({});
    },

    storeIcons: function() {
      if(!this.isNew() && !this.hasStoredIcons)
      {
        this.hasStoredIcons = true;
        this.get("icons").localStorage = new Store(this.id);
      }


    }



  });


  window.SlideList = Backbone.Collection.extend({
    model: Slide,

    initialize: function(conf) {
      this.localStorage= new Store(conf.ID);
    },

    setCurrentSlide: function(obj) {
      var slide = this.at(window.gallery.getIndex());
      slide.set(obj);
      slide.save();
    }
  });




  window.SlideView = Backbone.View.extend({

    template: _.template($('#slide-template').html()),
    events: {
      "dblclick img": "updateImageSRC"
    },

    initialize: function() {

      this.model.bind('change', this.render, this);
      this.model.bind('destroy', this.remove, this);
      this.model.get("icons").bind('reset', this.addAll, this);
      this.model.get("icons").bind('destroy', this.removeIcon, this);
      this.model.get("icons").bind("add",this.appendIcon, this );

      this.iconsViews= [],
      Slides.bind('all',   this.render, this);
      $(this.el).addClass("slide");
      this.model.storeIcons();
      this.model.get("icons").fetch();
    },

    loadIcons: function() {
      var icons =  this.model.get("icons");
      if(!icons.bind)
      {
        icons = new Icons(icons);
      }

      this.model.set("icons", icons);

    },

    appendIcon: function(icon) {

      var iconView = new IconView({model:icon});
      this.iconsViews.push(iconView  );
      this.$(".icons").append(iconView.render().el);

    },

    removeIcon: function(ic) {
      this.iconsViews = _.select(this.iconsViews, function(icon) {
        return ic.cid != icon.model.cid;
      });
    },




    updateImageSRC: function(){

      var newURL = prompt("Please enter the src of the image:", this.model.get("url"));
      if(newURL){
        this.model.set({url:newURL});
        this.model.save();
      }
    },

    renderIcons: function(el) {

      $(".icons", el).html("");

      for(var i = 0; i < this.iconsViews.length; i++)
      {
        $(".icons", el).append(this.iconsViews[i].render().el);
      };
      window.gallery.addClickEvents();
    },

    remove: function() {

      $(this.el).remove();

      window.gallery.update();
    },

    render: function() {
      $(this.el).html(this.template(this.model.toJSON()));
      this.renderIcons(this.el);
      return this;
    },

    addAll: function(icons) {
      var self= this;
      icons.each(function(icon){self.appendIcon(icon);});
    }


  });

//---------------- Main Gallery

 window.Gallery = Backbone.Model.extend({
    defaults: function() {
      return {title: "Title" ,  width:986, height:530 };
    }
  });

  window.Galleries = Backbone.Collection.extend({

     model: Gallery,

    initialize: function(conf) {
      this.localStorage= new Store(conf.ID);

    },

  });

  window.GalleryEditor = Backbone.View.extend({

    el: $(".GalleryBoylston"),

    gallery: new Gallery(),
    images:  new SlideImagesView(),

    outputTemplate: _.template($('#galleryBoylston-template').html()),
    ecaptionTemplate:  _.template($('#ecaption-template').html()),

    events: {
      "click .newslide": "newSlide",
      "click .newicon": "newIcon",
      "blur #GTitle": "updateTitle",
      "click .clearAll": "clearAll",
      "click .deleteslide": "deleteSlide"
    },

    initialize: function() {
      Slides.bind('add',   this.addSlide, this);
      Slides.bind('reset', this.addAll, this);
      Slides.bind('all',   this.render, this);
      this.model.bind('reset',   this.addModel, this);
      this.model.fetch();
      Slides.fetch();
      this.captionEvent();
      this.addResizeEvents();
    },


    addResizeEvents: function() {
      var that  = this;
      this.$(".slider").resizable( {
        resize: function(event, ui) {
          that.updateSize(ui.size.width, ui.size.height);
        },
        stop: function(event, ui) {
          that.gallery.set( ui.size ).save();
        }
      });
    },


    updateSize: function(w,h) {
      $("#dropbox,#gOut").css("width", w);
      this.$("#Size").html(w+"x"+h);
      this.el.css("width", w);
      this.$(".slider").css({
        width: w,
        height: h
      });
    },


    captionEvent: function() {
      var that = this;
      this.$("#Caption, #SlideLink").click(function(){
        that.editCaption();
        return false;
      });
    },
    editCaption: function() {
      var that = this;
      that.$("#SlideInfo").html(this.ecaptionTemplate( this.currentSlide().toJSON()));

      that.$("#SlideInfo input[name='save']").click(function(){

        that.currentSlide().set(
          {
            LinkURL:$("#SlideInfo input[name='LinkURL']").val(),
            txt:$("#SlideInfo textarea[name='txt']").val()
          }).save();
        that.updateSlideInfo();
      });
      this.$("#SlideInfo input[name='cancel']").click(function(){
        that.updateSlideInfo();
      });

    },

    updateSlideInfo: function() {
      this.$("#SlideInfo").html($("#slideInfo-template").html());
      window.gallery.update();
      this.captionEvent();
      this.render();

    },

    clearAll: function() {
      if(localStorage)
        localStorage.clear();
    },

    newIcon: function(){
      this.currentSlide().newIcon();
      window.gallery.addClickEvents();
    },

    newSlide: function() {
      Slides.create({});
    },

    currentSlide: function() {
      return Slides.at(window.gallery.getIndex());
    },


    deleteSlide: function() {
      this.currentSlide().destroy();
    },

    updateTitle: function() {
      this.gallery.set({title:$("#GTitle").val()}).save();
    },

    addSlide: function(slide) {
      var slideView = new SlideView({model:slide}),
      slideEl = slideView.render().el;

      this.$(".slider").append(slideEl);
      window.gallery.gotToSlide(slideEl);
    },

    addAll: function(s) {
      Slides.each(this.addSlide);
    },


    addModel: function(g)
    {
      var gal =  g.at(0);

      if(gal)
      {
        this.gallery = gal;
      }
      else
      {
        var w = (this.$(".slider").width() > 50)?this.$(".slider").width():986 ;
        var h = (this.$(".slider").height() > 50)?this.$(".slider").height():530 ;
        this.gallery = this.model.create( {width:w, height:h });

      }
      this.gallery.bind('all',   this.render, this);
      this.render();
    },

    render: function() {
      this.updateSize(this.gallery.get("width"),this.gallery.get("height") );
      var slider = this.$(".slider").clone(),
      classes = this.el.attr("class"),
      id = this.gallery.get("title").replace(/ /g, "_");

      $(".slide",slider).removeAttr("style");

      $(".point",slider).removeClass("c");
      $("#GTitle").val(this.gallery.get("title"));
      $("#gOut .gallery").val(this.outputTemplate({
        title:id,
        slides: slider.html(),
        classes: classes,
        height: this.gallery.get("height"),
        width: this.gallery.get("width")}));
      return this;
    }



  });



});




