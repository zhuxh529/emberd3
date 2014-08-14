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
  barWidth:0,
  actions:{
    goClean: function(){
      if(d3.selectAll(".newbar")[0].length!=0){
      d3.selectAll(".newbar")
      .remove();
      }
      this.set('axis_mode','percent'); /*so that it can actually go through goValue
       function; axis_mode will be changed back to 'value' in goValue fn.
      */
      this.send('goValue');
    
    },

    goTest: function(){
      alert("hello Dude");
    },

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
        return "<strong style='font-size: 14px;'>Name:</strong> <span style='color:red;font-size: 14px;'>" + d.name.split(":")[0]+ "</span><strong style='font-size: 14px;'>Value:</strong> <span style='color:red;font-size: 14px;'>" + d.value.toFixed(3)+ "</span> <strong style='font-size: 14px;'> Percent: </strong><span style='color:red;font-size: 14px;'><span style='color:red;font-size: 14px;'>" +d.percent.toFixed(2)+ "%</span> ";
      
      });
      var comp=this;
      var existedCumulative=[];
      var cumulated=[];

      var barWidth=comp.get('barWidth');
      var barData=comp.get('barValues');

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
      for (var c = 0, m = table.rows[1].cells.length; c < m; c++) {
                newbarValues.push( parseFloat(table.rows[1].cells[c].innerHTML));
            }
      $('.table').editableTableWidget();


      //table change triggered function, very important here~
      $('.table td').on('change', function(evt, newValue) {
        var index=evt.currentTarget.cellIndex;
       
        var diff=0;
        if(index==0) diff=parseFloat(newValue-newbarValues[index]);
        else diff=parseFloat(newValue-newbarValues[index]);
        if((tableDatas[index].type=="acc" && index!=0 )|| index==table.rows[1].cells.length-1) {alert("You can't modify cumulated bars Dude XD");return false;}
        existedCumulative=[];
        cumulated=[];
        for(var i=index;i<table.rows[1].cells.length;i++){
          if(barData[i].type=="acc"){
            newbarValues[i]=newbarValues[i]+diff;
          }
        }
        newbarValues[index]=newValue;

      //redraw existing bars to new domain
        var ymin=max;
        var ymax=min;
        for(var i=0;i<newbarValues.length;i++){
          if(newbarValues[i]>ymax) ymax=newbarValues[i];
          if(parseFloat(tableDatas[i].value)>ymax) ymax=parseFloat(tableDatas[i].value);
          if(tableDatas[i].value>0 && newbarValues[i]<0) ymin=newbarValues[i];
        }
        var temp=newbarValues[newbarValues.length-1];
        ymin=ymin<temp?ymin:temp;
        ymin=ymin<0?ymin:0;
        y.domain([ymax,ymin]).nice();

        var id = comp.$().attr('id');
        var svg = d3.select("#"+id);

        svg.select(".enter").selectAll("rect")
        .transition()
        .duration(duration)
        .attr("height", function(d,i) {
       
        if(d.depth==1){ d.value<0||i==1?edge.push((edge[i]+d.value)): edge.push(d.value); bars.push(d.value);} 
        //alert(d.value);
        return Math.abs(y(d.value)-y(0));
      })
      .attr("y", function(d,i){

        var firstCumulated=[];
        var data=d;
         if(data.depth==0) {firstCumulated=[];}



  var index=0;
        if(d.depth==1){
        if(i==0) existedCumulative.push(d.value);
        if(d.type==null){
          return d.value<0?y(d.parent.children[i-1].value):y(d.value);
          }
        else{
              if(d.type=="acc"){
                // firstexistedCumulative.push(d.value);
                return d.value<0?(y(0)):y(d.value);
              }
              else if(d.type=="dec"){
                var len=existedCumulative.length-1; existedCumulative.push(existedCumulative[len]+d.value);
                if(d.parent.children[i-1].type=="acc" ) return y(d.parent.children[i-1].value);
                else {
                  // firstexistedCumulative.push(firstexistedCumulative[firstexistedCumulative.length-1]+d.value);
                  return y(existedCumulative[len]);}
              }
              else if(d.type=="inc"){
                var len=existedCumulative.length-1; existedCumulative.push(existedCumulative[len]+d.value);
                if(d.parent.children[i-1].type=="acc" ) return y(d.parent.children[i-1].value+d.value);
                else {
                  // firstexistedCumulative.push(firstexistedCumulative[firstexistedCumulative.length-1]+d.value);
                  return y(existedCumulative[len]+d.value);}
              }
              else{
                alert("data format error: type is wrong dude XD");
              }
            }
        }
        else{
          return d.value<0?y(-d.value):y(d.value);
        }
      


      });

      var yAxis = d3.svg.axis()
        .scale(y)
        .orient("left")
    
      svg.selectAll(".y.axis").transition()
      .duration(duration)
      .attr("transform", "translate( 0,0)")
      .call(yAxis);



        //add a new layer of 'if-senario bars'
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




        function addBars(index, newValue){

      if(d3.selectAll(".newbar")[0].length!=0){
      d3.selectAll(".newbar")
      .remove();
      }



      //hard to clone barData to new ones..
      //var newdata=jQuery.extend({}, barData);

      var data=[];
      var names=[];
      var types=[];
      barData.forEach(function(d){ names.push(d.name);types.push(d.type);
      });
      newbarValues.forEach(function(d){ data.push(parseFloat(d));});
      var xx=0;


      // barData[index].name=barData[index].name+"-new";

      test1.selectAll("rect")
      .data(data, function(d) {return d+ Math.random()*0.01;})
      .enter()
      .append("rect")
      .attr("class", "newbar")
      .transition()
      .duration(duration)
      .attr("fill-opacity",0.96)
      .attr("fill", "#e6550d")
      .attr("x", function(d,i){ return (barWidth*barGap)*(i+0.3);})
      .attr("height", function(d,i) { 
        // return x(d.value)<0?-x(d.value):x(d.value);
        return Math.abs(y(d)-y(0));
      })
  .attr("width", 0.85*barWidth)
  .attr("y", function(d,i){ 
    //alert("hololl");
        // if(names[i].indexOf(":last")>0){return d<0?y(0):y(d); }


        // if(i==data.length-1){return d<0?y(0):y(d); }
        // var a=parseFloat(tableDatas[i].value);
        // if(a>0 && d<0) return y(0); 
        // return d<0?(y(data[i-1])):y(d);


        var firstCumulated=[];
        var data1=barData;

 
  var index=0; 
        if(data1[i].depth==1){
        if(i==0) cumulated.push(d);
        if(data1[i].type==null){
          return d<0?y(data1[i-1].value):y(d);
          }
        else{
              if(data1[i].type=="acc"){
                return d<0?(y(0)):y(d);
              }
              else if(data1[i].type=="dec"){
                var len=cumulated.length-1; cumulated.push(cumulated[len]+d);
                if(data1[i-1].type=="acc" ) return d<=0?y(data[i-1]):y(data[i-1]+d);
                else {
                  return d<=0?y(cumulated[len]):y(cumulated[len]+d);}
              }
              else if(data1[i].type=="inc"){
                var len=cumulated.length-1; cumulated.push(cumulated[len]+d);
                if(data1[i-1].type=="acc" ) return d>=0?y(data[i-1]+d):y(data[i-1]);
                else {
                  return d>=0?y(cumulated[len]+d):y(cumulated[len]);}
              }
              else{
                alert("data format error: type is wrong dude XD");
              }
            }
        }
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
         tipdata.percent=100*d/data[0];

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
var cumulated=[];
var firstCumulated=[];
var barWidth = 75;
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

// svg.append("text")
//         .attr("x", (width / 2))             
//         .attr("y", 0 - (margin.top / 2))
//         .attr("text-anchor", "middle")  
//         .style("font-size", "19px") 
//         .text("My Waterfall Graph");

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
  
  
  var l=traverseNode(root);
  barWidth=width/(barGap*1.06*l);
  barWidth=barWidth>100?100:barWidth;
  
  x_low=0;
  
    x_low=root.children[root.children.length-1].value;
    x_low=x_low<0?x_low:0;

  y.domain([ root.value,x_low]).nice();
  comp.set('barValues', root.children);
  comp.set('barWidth', barWidth);
  comp.set('y', y);
  down(root, 0);
  svg.call(tip);

});


function traverseNode(node){
  //to get the max children.length
  if(!node.children) return 1;
  var maxLength=0;
 
  for(var nodes=0;nodes< node.children.length;nodes++){
    if(datafile=="data_2.json") {
      var aa=1;
    }
    var nn=traverseNode(node.children[nodes]);
    maxLength=nn>maxLength?nn:maxLength;
  }

  var l=node.children.length
  return l>maxLength?l:maxLength;

}



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
      .attr("transform", function(d, i) { return "translate(" + barWidth * i * barGap + ",0)"; });

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
      .attr("y", sety(d))
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
      .attr("y", sety(d));

  // Rebind the current node to the background.
  svg.select(".background")
      .datum(d)
      .transition()
      .duration(end);

  d.index = i;
}

function up(d) {

  if (!d.parent || this.__transition__) return;
  comp.set('depth',d.depth-1);
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
      .attr("transform", function(d, i) { return "translate(" + barWidth * i * barGap + ",0)"; })
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
        .attr("y", sety(d))
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
      .attr("y", sety(d) )
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
      .attr("x", 4*barWidth/5)
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
      .attr("width", barWidth)
      .attr("y", sety(d));




  // bar.append("rect")
  //     .attr("width", function(d,i) { d.value<0||i==1?edge.push(edge[i]+d.value): edge.push(d.value);
  //      return x(d.value)<0?-x(d.value):x(d.value);})
  //     .attr("height", barWidth)
  //     .attr("x", function(d,i){ alert(edge[i]); return d.value<0?x(5.3):0;} );

  return bar;
}

// A stateful closure for stacking bars horizontally.

function findYOffset(data,i){
  var accIndex=i;
  var status=data.type;
  while(status!="acc"){
    accIndex=accIndex-1;
    status=data.parent.children[accIndex].type;
  }

  var ret=0;
  for(var j=accIndex;j<i;j++){
    ret+=data.parent.children[j].value;
  }

  return ret;

}

function stack(data,i) {

  var y0=0;
  var tmp=0;
  var y_offset=0;
  if(data.parent && data.depth==1) {
      y_offset=data.value>0?0:y(data.parent.children[i-1].value+data.value)-y(0); // if objects in data file have no 'type' attribute
      
      //the following shows the situation when onjects in data file have 'type' attribute
     
      if(data.type!=null){
        if(data.type=="acc"){
          y_offset=data.value>0?0:-y(-data.value)+y(0);
        }
        else if(data.type=="dec"){
          if (data.parent.children[i-1].type=="acc") {
            //firstCumulated.push(data.parent.children[i-1].value+data.value);
            y_offset=y(data.parent.children[i-1].value+data.value)-y(0);
          }
          else{
            var vv=findYOffset(data,i);
            y_offset=y(vv+data.value)-y(0);
            
          }
        }
        else if(data.type=="inc"){
          if (data.parent.children[i-1].type=="acc"){
            //firstCumulated.push(data.parent.children[i-1].davalueta+data.value); 
            y_offset=y(data.parent.children[i-1].value)-y(0);
          }
          else{
            var vv=findYOffset(data,i);
            y_offset=y(vv)-y(0);
          }
        }
        var aa=1;
      }
  
    //y_offset=data.value>0?0:y(data.parent.children[i-1].value+data.value)-y(0);
  }

  if(data.depth>1){
    y_offset=0;
  }


  var dataV=data.value>0?data.value:-data.value;
  var uplimit=dataV;
  var downlimit=0;
  return function(d) {
    var dV=d.value>0?d.value:-d.value;
    

    downlimit=uplimit-dV;
    y0=y(dataV)-y(dV)-tmp+y_offset;
    var tx = "translate(" +barWidth * i * barGap + "," + y0  + ")";
    tmp=tmp+y(uplimit)-y(downlimit);
    uplimit=downlimit;
    //y0 -=y(d.value);
    if(d.depth>1){
      var a=1;  
    }
    return tx;
  };
}



function sety(data){
  if(data.depth==0) {firstCumulated=[];}
  cumulated=[];
  var index=0;
  return function(d,i){ 
        if(d.depth==1){
        if(i==0) cumulated.push(d.value);
        if(d.type==null){
          return d.value<0?y(d.parent.children[i-1].value):y(d.value);
          }
        else{
              if(d.type=="acc"){
                // firstCumulated.push(d.value);
                return d.value<0?(y(0)):y(d.value);
              }
              else if(d.type=="dec"){
                var len=cumulated.length-1; cumulated.push(cumulated[len]+d.value);
                if(d.parent.children[i-1].type=="acc" ) return y(d.parent.children[i-1].value);
                else {
                  // firstCumulated.push(firstCumulated[firstCumulated.length-1]+d.value);
                  return y(cumulated[len]);}
              }
              else if(d.type=="inc"){
                var len=cumulated.length-1; cumulated.push(cumulated[len]+d.value);
                if(d.parent.children[i-1].type=="acc" ) return y(d.parent.children[i-1].value+d.value);
                else {
                  // firstCumulated.push(firstCumulated[firstCumulated.length-1]+d.value);
                  return y(cumulated[len]+d.value);}
              }
              else{
                alert("data format error: type is wrong dude XD");
              }
            }
        }
        else{
          return d.value<0?y(-d.value):y(d.value);
        }
      }
}

  }
  //.observes('axis_mode')

});
