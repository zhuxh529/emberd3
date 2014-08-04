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
var barHeight = 75;
var barGap = 1.4;
var max, min;
max=Number.MAX_VALUE;
min=Number.MIN_VALUE;

 

/* water-fall global constants ends here*/




App.WaterfallChartComponent = Ember.Component.extend({
  axis_mode:'value',
  barValues:[],
  y:d3.scale.linear().range([0,height]),
  depth:0,
  layer1Data:{},
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
      
      var dd=svg.select(".enter").selectAll("rect")[0][0].__data__;
      whole=(dd.depth==1)?svg.select(".enter").selectAll("rect")[0][0].__data__.parent.children[0].value:dd.parent.value;
      svg.select(".enter").selectAll("rect").each(function(d){ 
        //whole= (d.depth==1)?d.parent.children[0].value:d.parent.value;
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
      this.set('y',y);
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
      if(this.get('depth')!=0) {alert("if senario only works for depth=0"); return;} 
       var tip = d3.tip()
       .attr('class', 'd3-tip')
       .offset([-10, 0])
       .html(function(d) {
        return "<strong style='font-size: 14px;'>Name:</strong> <span style='color:red;font-size: 14px;'>" + d.name.split(":")[0]+ "</span><strong style='font-size: 14px;'>Value:</strong> <span style='color:red;font-size: 14px;'>" + Math.round(d.value*10000) / 10000+ "</span> <strong style='font-size: 14px;'> Percent:</strong><span style='color:red;font-size: 14px;'>" + "%</span> ";
      
      });
      
      var y=this.get('y');
      var id = this.$().attr('id');
      var svg = d3.select("#"+id);
      svg.select("svg").call(tip);

      var test1=svg.select(".enter");
      var tableDatas=this.get('layer1Data');

      var newdiv= document.createElement('div');
      newdiv.className="container hero-unit";
      var table = document.createElement("TABLE");
      table.className="table table-striped";
      var row0 = table.insertRow(0);
      var row1 = table.insertRow(1);
      var cell0, cell1;
      for(var i= 0; i< tableDatas.length;i++){
        cell0=row0.insertCell(i);
        cell1=row1.insertCell(i);
        cell0.innerHTML = tableDatas[i].name;
        cell1.innerHTML = tableDatas[i].value.toFixed(3);

      }

      

      newdiv.appendChild(table);
      var divId=this.$().attr('id')+"pop";
      newdiv.id=divId;
      var tableId=this.$().attr('id')+"table";
      table.id=tableId;
      document.getElementById(this.$().attr('id')).appendChild(newdiv);
      var newbarValues=[];
      $('.table').editableTableWidget();
      $('.table td').on('change', function(evt, newValue) {
        newbarValues=[];
        for (var c = 0, m = table.rows[1].cells.length; c < m; c++) {
                newbarValues.push( parseFloat(table.rows[1].cells[c].innerHTML));
            }
        var index=evt.currentTarget.cellIndex;
        var diff=0;
        if(index==0) diff=(newValue-tableDatas[index].value);
        else diff=(newValue-tableDatas[index].value);
        if((tableDatas[index].value>0 && index!=0 )|| index==table.rows[1].cells.length-1) return false;

        for(var i=index+1;i<table.rows[1].cells.length;i++){
          if(tableDatas[i].value>0 || i==table.rows[1].cells.length-1){
            newbarValues[i]=newbarValues[i]+diff;
          }
        }
          
          addBars(index, newValue);
      });

      var dia=$( "#"+this.$().attr('id')+" #"+divId ).dialog({
      autoOpen: false,
      width: 1000,
      modal: true,
      show: {
        effect: "blind",
        duration: 500
      },
      hide: {
        effect: "scale",
        duration: 500
      }
        });
      dia.dialog("open");



        var on=false;
        var comp=this;
      
      

      function addBars(index, newValue){

      // if(on!=true){ on=true;} 
      // else {
      // d3.selectAll(".newbar")
      // .exit()
      // .remove(); 
      // on=false;
      // return;
      // }

      if(d3.selectAll(".newbar")[0].length!=0){
      d3.selectAll(".newbar")
      .remove();
      }



      var mydata=comp.get('barValues');
      var data=[];
      var names=[];
      mydata.forEach(function(d){ names.push(d.name);
      });
      newbarValues.forEach(function(d){ data.push(d);});
      var xx=0;


      // mydata[index].name=mydata[index].name+"-new";


      test1.selectAll("rect")
      .data(data, function(d) {return d;})
      .enter()
      .append("rect")
      .attr("class", "newbar")
      .transition()
      .duration(duration)
      .attr("fill-opacity",0.96)
      .attr("fill", "#e6550d")
      .attr("x", function(d,i){ return (barHeight*barGap)*(i+0.3);})
      .attr("height", function(d,i) { 
        // return x(d.value)<0?-x(d.value):x(d.value);
        return Math.abs(y(d)-y(0));
      })
  .attr("width", 0.85*barHeight)
  .attr("y", function(d,i){ 
    //alert("hololl");
        if(names[i].indexOf(":last")>0){return d<0?y(0):y(d); }
        return d<0?(y(data[i-1])):y(d);

      });

var tipdata = {
    name: "",
    value:0,
    percent : 0
};

  test1.selectAll(".newbar")
  .on("mouseover", function(d,i) { 
         d3.select(this).style("fill","orangered");
         tipdata.name=names[i];
         tipdata.value=d;

         tip.show(tipdata);
      })
      .on("mouseout", function(d,i) { 
        d3.select(this).style("fill","#e6550d");
        tip.hide();

      });
}

      
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
    .attr("class", "x axis")
    .style({ 'stroke-width': '1.5px'});

svg.append("g")
    .attr("class", "y axis")
    .style({ 'stroke-width': '1.5px'})
  .append("line")
    .attr("y1", "100%");

 if(this.get('axis_mode')=="percent") {
  //alert(this.get('axis_mode'));
  var formatter = d3.format(".0%");
 
  //yAxis.tickFormat(formatter);
 }


  


d3.json(datafile, function(error, root) {
  partition.sort(null).nodes(root);
  comp.set('barValues', root.children);

 x_low=0;
  
    x_low=root.children[root.children.length-1].value;
    x_low=x_low<0?x_low:0;

  y.domain([ root.value,x_low]).nice();
  comp.set('y', y);
  down(root, 0);
  svg.call(tip);

});




function down(d, i) {
  if (!d.children || this.__transition__) return;
  comp.set('depth',d.depth);
  comp.set('axis_mode', "value");

  if(d.depth==0){
    comp.set('layer1Data',d.children);
  }


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
  comp.set('y', y);
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
      .attr("transform", function(d, i) { return "translate(" + barHeight * i * barGap + ",0)"; });

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
  comp.set('depth',d.depth);
  comp.set('axis_mode', "value");
  if(d.depth==0){
    comp.set('layer1Data',d.children);
  }


  var end = duration + d.children.length * delay;

  // Mark any currently-displayed bars as exiting.
  var exit = svg.selectAll(".enter")
      .attr("class", "exit");

  // Enter the new bars for the clicked-on data's parent.
  var enter = bar(d.parent)
      .attr("transform", function(d, i) { return "translate(" + barHeight * i * barGap + ",0)"; })
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
    var tx = "translate(" +barHeight * i * barGap + "," + x0 + ")";
    x0 += d.value<0?-y(d.value):y(d.value);
    // alert(x0);
    return tx;
  };
}
  }
  //.observes('axis_mode')

});
