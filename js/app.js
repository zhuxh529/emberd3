App = Ember.Application.create();

/* water-fall global constants starts here*/

var x_low=0;
var edge=[0];
var bars=[];
var margin = {top: 40, right: 120, bottom: 15, left: 120},
    width = 960 - margin.left - margin.right,
    height = 700 - margin.top - margin.bottom;
var duration = 750,
    delay = 25;
var max, min;
max=Number.MAX_VALUE;
min=Number.MIN_VALUE;

/* water-fall global constants ends here*/



App.ApplicationRoute = Ember.Route.extend({
  model: function(){
    return { title: "this is title"};
  }

});




App.WaterfallChartComponent = Ember.Component.extend({
  axis_mode:'value',
  actions:{
    goPercent: function(){
      var whole;
      edge=[];
      if(this.get('axis_mode')=="percent") return;
      this.set('axis_mode', "percent");

      var id = this.$().attr('id');
      var svg = d3.select("#"+id);
      
      var dmin=0;
      var y = d3.scale.linear()
        .range([0,height]);
      
      svg.select(".enter").selectAll("rect").each(function(d){ 
        whole= (d.depth==1)?d.parent.children[0].value:d.parent.value;
        var len=d.parent.children.length;
        dmin=(d.depth==1)?d.parent.children[len-1].value:0;

      });
      
      dmin=dmin>0?0:dmin;
      y.domain([1.2,dmin/Math.abs(whole)]);

      svg.select(".enter").selectAll("rect")
      .transition()
      .duration(duration)
      .attr("height", function(d,i) {
       
        if(d.depth==1){ d.value<0||i==1?edge.push((edge[i]+d.value)/whole): edge.push(d.value/whole); bars.push(d.value/whole);} 
        //alert(d.value);
        return Math.abs(y(d.value/whole)-y(0));
      })
      .attr("y", function(d,i){         
        if(d.depth==1){
        if(d.name.indexOf(":last")>0){return d.value<0?y(0):y(d.value/whole); }
        return d.value<0?(y(d.parent.children[i-1].value/whole)):y(d.value/whole);}
        else{
          return y(Math.abs(d.value/whole));
        }
      });
      var formatter = d3.format(".0%");
      var yAxis = d3.svg.axis()
        .scale(y)
        .orient("left")
        .tickFormat(formatter);
    
      svg.selectAll(".y.axis").transition()
      .duration(duration)
      .attr("transform", "translate( 0,0)")
      .call(yAxis);

    },
    goValue: function(){
      var whole;
      edge=[];
      if(this.get('axis_mode')=="value") return;
      this.set('axis_mode', "value");

      var id = this.$().attr('id');
      var svg = d3.select("#"+id);
      
      var dmin=0;
      var dmax=min;
      var y = d3.scale.linear()
        .range([0,height]);
      var depth=0;
      whole=1;
      svg.select(".enter").selectAll("rect").each(function(d){ 
        depth=d.depth;
        var len=d.parent.children.length;
        dmin=(d.depth==1)?d.parent.children[len-1].value:0;
        var tmp=Math.abs(d.value);
        dmax=dmax<tmp?tmp:dmax;
      });
      

      dmin=dmin>0?0:dmin;
      y.domain([dmax*1.1,dmin]);

      svg.select(".enter").selectAll("rect")
      .transition()
      .duration(duration)
      .attr("height", function(d,i) {
       
        if(d.depth==1){ d.value<0||i==1?edge.push((edge[i]+d.value)/whole): edge.push(d.value/whole); bars.push(d.value/whole);} 
         //alert(d.value);
        return Math.abs(y(d.value/whole)-y(0));
      })
      .attr("y", function(d,i){         
        if(d.depth==1){
        if(d.name.indexOf(":last")>0){return d.value<0?y(0):y(d.value/whole); }
        return d.value<0?(y(d.parent.children[i-1].value/whole)):y(d.value/whole);}
        else{
          return y(Math.abs(d.value)/Math.abs(whole));
        }
      });
      var yAxis = d3.svg.axis()
        .scale(y)
        .orient("left");
    
      svg.selectAll(".y.axis").transition()
      .duration(duration)
      .attr("transform", "translate( 0,0)")
      .call(yAxis);
    },

     goif: function(){
      var newdiv= document.createElement('div');
      var table = document.createElement("TABLE");
      var row = table.insertRow(0);
      var cell1 = row.insertCell(0);
      var cell2 = row.insertCell(1);
      var cell3 = row.insertCell(2);
      var cell4 = row.insertCell(3);
      cell1.innerHTML = "NEW CELL1 ";
      cell2.innerHTML = "NEW CELL2 ";
      cell3.innerHTML = "NEW CELL3 ";
      cell4.innerHTML = "NEW CELL4 ";
      cell1.contentEditable = true;
      newdiv.appendChild(table);
      var myid=this.$().attr('id')+"pop";
      newdiv.setAttribute("class",myid);
      document.getElementById(this.$().attr('id')).appendChild(newdiv);
      
      var dia=$( "#"+this.$().attr('id')+" ."+myid ).dialog({
      autoOpen: false,
      width: 500,
      modal: true,
      show: {
        effect: "blind",
        duration: 500
      },
      hide: {
        effect: "explode",
        duration: 500
      }
        });
      dia.dialog("open");
      
     }

  },

  didInsertElement: function(){

var datafile=this.get('file');
var id = this.$().attr('id');
var y = d3.scale.linear()
    .range([0,height]);

var percent_y=d3.scale.linear()
    .domain([0,100])
    .range([0,height]);

var x = d3.scale.linear()
    .range([0, width]);

var barHeight = 75;

var color = d3.scale.ordinal()
    .range(["orange", "#ccc"]);

var cost_color=d3.scale.ordinal()
    .range(["#CC3333", "#ccc"]);



var partition = d3.layout.partition()
    .value(function(d) { return d.size; });

var yAxis = d3.svg.axis()
    .scale(y)
    .orient("left");

var xAxis = d3.svg.axis()
    .scale(x)
    .ticks(0)
    .orient("top");

var width_scale;
var comp=this;


var svg = d3.select("#"+id).append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

svg.append("rect")
    .attr("class", "background")
    .attr("width", width)
    .attr("height", height)
    .on("click", up);

svg.append("text")
        .attr("x", (width / 2))             
        .attr("y", 0 - (margin.top / 2))
        .attr("text-anchor", "middle")  
        .style("font-size", "19px") 
        .text("My Waterfall Graph");

svg.append("g")
    .attr("class", "x axis");

svg.append("g")
    .attr("class", "y axis")
  .append("line")
    .attr("y1", "100%");

 if(this.get('axis_mode')=="percent") {
  //alert(this.get('axis_mode'));
  var formatter = d3.format(".0%");
 
  //yAxis.tickFormat(formatter);
 }

 var tip = d3.tip()
  .attr('class', 'd3-tip')
  .offset([-10, 0])
  .html(function(d) {
    if(d.depth==1){
    return "<strong style='font-size: 14px;'>Name:</strong> <span style='color:red;font-size: 14px;'>" + d.name.split(":")[0]+ "</span><strong style='font-size: 14px;'>Value:</strong> <span style='color:red;font-size: 14px;'>" + Math.round(d.value*10000) / 10000+ "</span> <strong style='font-size: 14px;'> Percent:</strong><span style='color:red;font-size: 14px;'>" +Math.round(d.value/d.parent.children[0].value*1000)/10+ "%</span> ";
    }
    else{
      return "<strong style='font-size: 14px;'>Name:</strong> <span style='color:red;font-size: 14px;'>" + d.name.split(":")[0]+ "</span><strong style='font-size: 14px;'>Value:</strong> <span style='color:red;font-size: 14px;'>" + Math.round(d.value*10000) / 10000+ "</span> <strong style='font-size: 14px;'> Percent:</strong><span style='color:red;font-size: 14px;'>" +Math.round(d.value/d.parent.value*1000)/10+ "%</span> ";

    }
  });
  


d3.json(datafile, function(error, root) {
  partition.sort(null).nodes(root);

 x_low=0;
  
    x_low=root.children[root.children.length-1].value;
    x_low=x_low<0?x_low:0;

  y.domain([ root.value,x_low]).nice();

  down(root, 0);
  svg.call(tip);

});




function down(d, i) {
  if (!d.children || this.__transition__) return;
  comp.set('axis_mode', "value");


  var end = duration + d.children.length * delay;

  // Mark any currently-displayed bars as exiting.
  var exit = svg.selectAll(".enter")
      .attr("class", "exit");

  // Entering nodes immediately obscure the clicked-on bar, so hide it.
  exit.selectAll("rect").filter(function(p) { return p === d; })
      .style("fill-opacity", 1e-6);

  // Enter the new bars for the clicked-on data.
  // Per above, entering bars are immediately visible.
  var enter = bar(d)
      .attr("transform", stack(d,i))
      .style("opacity", 1);

  // Have the text fade-in, even though the bars are visible.
  // Color the bars as parents; they will fade to children if appropriate.
  enter.select("text").style("fill-opacity", 1e-6);
  enter.select("rect").style("fill",  function(d){ return (d.depth==1 && d.value<0)?cost_color(true):color(true); })
  .on("mouseover", function(d) { d3.select(this).style("fill","orangered"); tip.show(d); })
  .on("mouseout", function(d) { d3.select(this).style("fill", function(d){return (d.depth==1 && d.value<0)?cost_color(true):color(!!d.children);}); tip.hide(d);});

  // Update the x-scale domain.
  x_low=0;
  if(d.depth==0){
    x_low=d.children[d.children.length-1].value;
    x_low=x_low<0?x_low:0;
    
  }

  y.domain([ d3.max(d.children, function(d) { return d.value<0?-d.value:d.value; }),x_low]).nice();
  // Update the x-axis.
  svg.selectAll(".y.axis").transition()
      .duration(duration)
      .attr("transform", "translate(0,0)")
      .call(yAxis);


  svg.selectAll(".x.axis").transition()
      .duration(duration)
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis);


  // Transition entering bars to their new position.
  var enterTransition = enter.transition()
      .duration(duration)
      .delay(function(d, i) { return i * delay; })
      .attr("transform", function(d, i) { return "translate(" + barHeight * i * 1.2 + ",0)"; });

  // Transition entering text.
  enterTransition.select("text")
      .style("fill-opacity", 1);

  // Transition entering rects to the new x-scale.
  enterTransition.select("rect")
      .attr("height", function(d,i) { 
        // return x(d.value)<0?-x(d.value):x(d.value);
        if(d.depth==1){ d.value<0||i==1?edge.push(edge[i]+d.value): edge.push(d.value); bars.push(d.value);} 
         //alert(d.value);
        return Math.abs(y(d.value)-y(0));
      })
      .attr("y", function(d,i){ 
        if(d.depth==1){
        //return d.value<0?(y(0)+margin.left+margin.top):0;}
        if(d.name.indexOf(":last")>0){return d.value<0?(y(0)):y(d.value); }
        return d.value<0?(y(d.parent.children[i-1].value)):y(d.value);}
        else{
          return d.value<0?y(-d.value):y(d.value);
        }
        // return d.value<0?(-x(d.value)+margin.left+margin.top):0;
         //return -x(5.3)+margin.left+margin.top;
      } )
      .style("fill",  function(d) { return (d.depth==1 && d.value<0)?cost_color(true):color(!!d.children); });

  // Transition exiting bars to fade out.
  var exitTransition = exit.transition()
      .duration(duration)
      .style("opacity", 1e-6)
      .remove();

  // Transition exiting bars to the new x-scale.
  exitTransition.selectAll("rect")
      .attr("height", function(d,i) { 
        // return x(d.value)<0?-x(d.value):x(d.value);
        if(d.depth==1){ d.value<0||i==1?edge.push(edge[i]+d.value): edge.push(d.value); bars.push(d.value);} 
         //alert(d.value);
        return Math.abs(y(d.value)-y(0));
      })
      .attr("y", function(d,i){ 
        if(d.depth==1){
        //return d.value<0?(y(0)+margin.left+margin.top):0;}
        if(d.name.indexOf(":last")>0){ return d.value<0?(y(0)):y(d.value); }
        return d.value<0?(y(d.parent.children[i-1].value)):y(d.value);}
        else{
          return d.value<0?y(-d.value):y(d.value);
        // return d.value<0?(-x(d.value)+margin.left+margin.top):0;
         //return -x(5.3)+margin.left+margin.top;
       }
      } );

  // Rebind the current node to the background.
  svg.select(".background")
      .datum(d)
    .transition()
      .duration(end);

  d.index = i;
}

function up(d) {

  if (!d.parent || this.__transition__) return;
  comp.set('axis_mode', "value");
  var end = duration + d.children.length * delay;

  // Mark any currently-displayed bars as exiting.
  var exit = svg.selectAll(".enter")
      .attr("class", "exit");

  // Enter the new bars for the clicked-on data's parent.
  var enter = bar(d.parent)
      .attr("transform", function(d, i) { return "translate(" + barHeight * i * 1.2 + ",0)"; })
      .style("opacity", 1e-6);

  // Color the bars as appropriate.
  // Exiting nodes will obscure the parent bar, so hide it.
  enter.select("rect")
      .style("fill", function(d) { return (d.depth==1 && d.value<0)?cost_color(true):color(!!d.children); })
    .filter(function(p) { return p === d; })
      .style("fill-opacity", 1e-6);

  // Update the x-scale domain.
  x_low=0;
  if(d.depth==1){
    x_low=d.parent.children[d.parent.children.length-1].value;
    x_low=x_low<0?x_low:0;
    
  }
  //if(d.)

 y.domain([ d3.max(d.parent.children, function(d) { return d.value<0?-d.value:d.value;}),x_low]).nice();

  // Update the x-axis.
  svg.selectAll(".y.axis").transition()
      .duration(duration)
      .attr("transform", "translate( 0,0)")
      .call(yAxis);

  svg.selectAll(".x.axis").transition()
      .duration(duration)
      .call(xAxis);

  // Transition entering bars to fade in over the full duration.
  var enterTransition = enter.transition()
      .duration(end)
      .style("opacity", 1);

  // Transition entering rects to the new x-scale.
  // When the entering parent rect is done, make it visible!
  enterTransition.select("rect")
        .attr("y", function(d,i){ 
        if(d.depth==1){
        //return d.value<0?(x(0)+margin.left+margin.top):0;}
        if(d.name.indexOf(":last")>0){ return d.value<0?(y(0)):y(d.value); }

        return d.value<0?(y(d.parent.children[i-1].value)):y(d.value);}
        else{
          return d.value<0?y(-d.value):y(d.value);
        }
      })
     .attr("height", function(d,i) { 
        // return x(d.value)<0?-x(d.value):x(d.value);
        if(d.depth==1){ d.value<0||i==1?edge.push(edge[i]+d.value): edge.push(d.value); bars.push(d.value);} 
         //alert(d.value);
        return Math.abs(y(d.value)-y(0));
      })
      .each("end", function(p) { if (p === d) d3.select(this).style("fill-opacity", null); });

  // Transition exiting bars to the parent's position.
  var exitTransition = exit.selectAll("g").transition()
      .duration(duration)
      .delay(function(d, i) { return i * delay; })
      .attr("transform", stack(d,d.index));

  // Transition exiting text to fade out.
  exitTransition.select("text")
      .style("fill-opacity", 1e-6);

  // Transition exiting rects to the new scale and fade to parent color.
  exitTransition.select("rect")
      .attr("height", function(d,i) { 
        // return x(d.value)<0?-x(d.value):x(d.value);
        if(d.depth==1){ d.value<0||i==1?edge.push(edge[i]+d.value): edge.push(d.value); bars.push(d.value);} 
         //alert(d.value);
        return Math.abs(y(d.value)-y(0));
      })
      .attr("y", function(d,i){ 
        if(d.depth==1){
        //return d.value<0?(y(0)+margin.left+margin.top):0;}
        if(d.name.indexOf(":last")>0){ return d.value<0?(y(0)):y(d.value); }

        return d.value<0?(y(d.parent.children[i-1].value)):y(d.value);}
        else{
          return d.value<0?y(-d.value):y(d.value);
        }
        // return d.value<0?(-x(d.value)+margin.left+margin.top):0;
         //return -x(5.3)+margin.left+margin.top;
      } )
      .style("fill", function(d){return (d.depth==1 && d.value<0)?cost_color(true):color(true);});

  // Remove exiting nodes when the last child has finished transitioning.
  exit.transition()
      .duration(end)
      .remove();

  // Rebind the current parent to the background.
  svg.select(".background")
      .datum(d.parent)
    .transition()
      .duration(end);
}

// Creates a set of bars for the given data node, at the specified indey.
function bar(d) {
  edge=[];
 
  var bar = svg.insert("g", ".x.axis")
      .attr("class", "enter")
      .attr("transform", "translate(5,0)")
    .selectAll("g")
      .data(d.children)
    .enter().append("g")
      .style("cursor", function(d) { return !d.children ? null : "pointer"; })
      .on("click", down);

  bar.append("text")
      .attr("y", height+10)
      .attr("x", 4*barHeight/5)
      .attr("dy", ".35em")
      .style("text-anchor", "end")
      .text(function(d) { return d.name.split(":")[0]; });

  bar.append("rect")
       .on("mouseover", function(d) { d3.select(this).style("fill","orangered"); tip.show(d) ;})
       .on("mouseout", function(d) { d3.select(this).style("fill", function(d){return (d.depth==1 && d.value<0)?cost_color(true):color(!!d.children);}); tip.hide(d);})
      .attr("height", function(d,i) { 
        // return x(d.value)<0?-x(d.value):x(d.value);
        if(d.depth==1){ d.value<0||i==1?edge.push(edge[i]+d.value): edge.push(d.value); bars.push(d.value);} 
         //alert(d.value);
        return Math.abs(y(d.value)-y(0));
      })
      .attr("width", barHeight)
      .attr("y", function(d,i){ 
        if(d.depth==1){
        if(d.name.indexOf(":last")>0){ return d.value<0?(y(0)):y(d.value); }
        //alert(d.value<0?(height-y(0)):height-y(0));
        return d.value<0?y(d.parent.children[i-1].value):y(d.value);
        }

        else{
          return d.value<0?y(-d.value):y(d.value);
        }
        
      } );




  // bar.append("rect")
  //     .attr("width", function(d,i) { d.value<0||i==1?edge.push(edge[i]+d.value): edge.push(d.value);
  //      return x(d.value)<0?-x(d.value):x(d.value);})
  //     .attr("height", barHeight)
  //     .attr("x", function(d,i){ alert(edge[i]); return d.value<0?x(5.3):0;} );

  return bar;
}

// A stateful closure for stacking bars horizontally.
function stack(d,i) {

  //var index=i<d.parent.children.length?i+1:d.parent.children-1;
  var x0;
  if(d.name.indexOf(":last")>0 && d.value<0){ x0 =y(d.parent.children[i-1].value);}
  else{
  x0 =y(d.parent&&d.value<0?d.parent.children[i+1].value:0);
  }
  var depth=1;
  return function(d) {
    //x0=(d.depth==depth?x0;0);
    var tx = "translate(" +barHeight * i * 1.2 + "," + x0 + ")";
    x0 += d.value<0?-y(d.value):y(d.value);
    // alert(x0);
    return tx;
  };
}
  }
  //.observes('axis_mode')

});
