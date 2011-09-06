$(function() {

  window.Icon = Backbone.Model.extend({
    defaults: function() {
      return { title: "Title", top: "480px", left:"180px", body:"Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Pellentesque in tellus. In pharetra consequat augue. \n In congue. Curabitur pellentesque iaculis eros. Proin magna odio, posuere sed, commodo nec, varius nec, tortor. Fusce ante. Curabitur tincidunt. Duis posuere eleifend justo. Mauris sit amet ligula. Morbi sit amet sapien mollis neque ultricies placerat.", direction:""};}
  });



  window.Icons = Backbone.Collection.extend({
    model: Icon,

    initialize: function() {
      this.bind('change', this.change, this);

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
      }); ;

      $(that.el).removeClass("active");
      window.gallery.addClickEvents();
      return this;
    },

    reposition: function(){

      $(this.el).css("top",this.model.get("top"));
      $(this.el).css("left",this.model.get("left"));

    }

  });



  window.Slide = Backbone.Model.extend({
    initialize: function() {

      this.set({"icons": new Icons(this.get("icons"))});
      this.get("icons").localStorage = new Store(this.id);


    },
    defaults: function() {
      return { url:"images/1.png", title: "Title", icons: new Icons() , state: "" };
    }
    ,
    newIcon: function()
    {
      this.get("icons").create({});
    }

  });


  window.SlideList = Backbone.Collection.extend({
    model: Slide,
    localStorage: new Store("slides")
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



 window.Gallery = Backbone.Model.extend({
    defaults: function() {
      return {title: "Title" , id:"--" };
    }

  });

  window.Galleries = Backbone.Collection.extend({

    localStorage: new Store("Gallery")

  });

  window.GalleryEditor = Backbone.View.extend({

    el: $(".GalleryBoylston"),

    gallery: new Gallery(),

    outputTemplate: _.template($('#galleryBoylston-template').html()),

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
    },

    clearAll: function() {
      if(localStorage)
        localStorage.clear();
    },

    newIcon: function(){
      Slides.at(window.gallery.getIndex()).newIcon();
      window.gallery.addClickEvents();
    },

    newSlide: function() {
      Slides.create({});
    },

    deleteSlide: function() {
      Slides.at(window.gallery.getIndex()).destroy();
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
        this.gallery = this.model.create({title:"Gallery"});

      }
      this.gallery.bind('all',   this.render, this);
      this.render();

    },


    render: function() {
      window.gallery.update();
      var slider = this.$(".slider").clone(),
      id = this.gallery.get("title").replace(/ /g, "_")
      $(".point",slider).removeClass("c");
      $("#GTitle").val(this.gallery.get("title"));
      $("#gOut .gallery").val(this.outputTemplate({title:id,slides: slider.html()}));
      return this;
    }



  });
  window.Slides = new SlideList();
  window.gallery = $(".GalleryBoylston").BoylstonGallery();
  var g = new Galleries();
  new GalleryEditor({model:g});

});



