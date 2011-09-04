


$(function() {
      

      

      window.Icon = Backbone.Model.extend({
                                              defaults: function() {
                                                  return { title: "Title", top: "-500px", left:"100px", body:"Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Pellentesque in tellus. In pharetra consequat augue. \n In congue. Curabitur pellentesque iaculis eros. Proin magna odio, posuere sed, commodo nec, varius nec, tortor. Fusce ante. Curabitur tincidunt. Duis posuere eleifend justo. Mauris sit amet ligula. Morbi sit amet sapien mollis neque ultricies placerat.", direction:""};}
                                          });

      window.Icons = Backbone.Collection.extend({
                                                    model: Icon
                                                    
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
      window.Slides = new SlideList(); 




      window.IconView = Backbone.View.extend({
                                                 tagName: "div",

                                                 className: "icon",
                                           

                                                 template: _.template($('#icon-template').html()),
                                                 initialize: function() {
                                                     this.model.bind('change', this.render, this);
                                                     this.model.bind('destroy', this.remove, this);
                                                     
                                                 },
                                                 
                                                 updateBubble: function(){
                                                     
                                                     
                                                 },

                                                 render: function() {
                                                     
                                                     $(this.el).html(this.template(this.model.toJSON()));
                                                     
                                                     if("bottom" == this.model.get("direction"))
                                                         $(this.el).addClass("bottom");
                                                     else
                                                         $(this.el).removeClass("bottom"); 
                                                     
                                                     this.reposition(); 
                                                     var that = this; 
                                                     $(this.el).draggable({stop: function(event, ui){
                                                                               that.model.set({top:ui.position.top}); 
                                                                               that.model.set({left:ui.position.left});
                                                                               that.model.save();
                                                                           }});

                                                     this.$(".bubble").dblclick(function(){
                                                                                    that.updateBubble(); 
                                                                                }); ; 
                                                     
                                                     window.gallery.addClickEvents();
                                                     return this;
                                                 }, 

                                                 
                                                 

                                                 reposition: function(){

                                                     $(this.el).css("top",this.model.get("top")); 
                                                     $(this.el).css("left",this.model.get("left"));
                                                     
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
                                                  
                                                  updateImageSRC: function(){
                                                    
                                                      var newURL = prompt("Please enter the src of the image: :", this.model.get("url"));
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






      

      window.GalleryEditor = Backbone.View.extend({
                                                      
                                                      el: $(".GalleryBoylston") ,

                                                      events: {
                                                          "click .newslide": "newSlide",
                                                          "click .newicon": "newIcon"
                                                      },

                                                      initialize: function() {
                                                          Slides.bind('add',   this.addSlide, this);
                                                          Slides.bind('reset', this.addAll, this);
                                                          Slides.bind('all',   this.render, this);
                                                          Slides.fetch();
                                                          window.gallery.jumpToHash(); 
                                                           
                                                      },
                                                      newIcon: function(){                                                     
                                                          Slides.at(window.gallery.getIndex()).newIcon();
                                                          window.gallery.addClickEvents();
                                                      }, 

                                                      newSlide: function() {
                                                          Slides.create({}); 
                                                      },


                                                      addSlide: function(slide) {
                                                          var slideView = new SlideView({model:slide}),
                                                          slideEl = slideView.render().el; 
                                                          this.$(".slider").append(slideEl);
                                                          
                                                          
                                                          
                                                      },

                                                      addAll: function(s) {                                                          
                                                         Slides.each(this.addSlide);                                                          
                                                      },
                                                      

                                                      render: function() {
                                                          
                                                          
                                                          return this;
                                                      },

                                                      remove: function() {
                                                          $(this.el).remove();
                                                      }


                                                  }); 



      


      window.gallery = $(".GalleryBoylston").BoylstonGallery(); 
      new GalleryEditor(); 
  });



