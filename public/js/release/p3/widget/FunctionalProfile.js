define("p3/widget/FunctionalProfile", [
	"dojo/_base/declare", "dojo/_base/lang",
	"dojo/dom-class", "dojo/dom-construct", "dojo/on", "dojo/request",
	"./SummaryWidget", "../util/PathJoin", "./D3HorizontalBarChart"

], function(declare, lang,
			domClass, domConstruct, on, xhr,
			SummaryWidget, PathJoin, D3HorizontalBarChart){

	return declare([SummaryWidget], {
		dataModel: "genome_feature",
		query: "",
		baseQuery: "&ne(pgfam_id,%22%22)&limit(1)&facet((field,pgfam_id),(mincount,1),(sort,count),(limit,10))&json(nl,map)",
		columns: [
			{label: "Function", field: "label"},
			{
				label: "Genes", field: "count", renderCell: function(obj, val, node){
				node.innerHTML = '<a href="#view_tab=features&filter=eq(pgfam_id,' + obj.pgfam_id + ')" target="_blank">' + val + '</a>';
			}
			}
		],
		processData: function(res){

			if(!res || !res.facet_counts || !res.facet_counts.facet_fields || !res.facet_counts.facet_fields.pgfam_id){
				console.error("INVALID SUMMARY DATA");
				return;
			}

			var self = this;
			var d = res.facet_counts.facet_fields.pgfam_id; // now key-value pair
			var topIds = Object.keys(d);

			xhr.post(PathJoin(this.apiServiceUrl, "/protein_family_ref/"), {
				handleAs: "json",
				headers: {
					'Accept': "application/json",
					'Content-Type': "application/rqlquery+x-www-form-urlencoded",
					'X-Requested-With': null,
					'Authorization': window.App.authorizationToken || ""
				},
				data: "and(eq(family_type,pgfam),in(family_id,(" + topIds + ")))&select(family_id,family_product)"
			}).then(function(res){

				var dict = {};
				res.forEach(function(d){
					dict[d.family_id] = d['family_product'];
				});

				var data = [];
				Object.keys(topIds).forEach(function(key, idx){
					var pgfamId = topIds[idx];
					data.push({
						label: dict[pgfamId], pgfam_id: pgfamId, count: d[pgfamId],
						tooltip: function(obj){
							var content = [];
							content.push("Product: " + obj.label);
							content.push("PATRIC Global Family ID: " + obj.pgfam_id);
							content.push("Gene Count: " + obj.count);

							return content.join("<br/>");
						}
					});
				});

				self.set('data', data);
			});
		},

		postCreate: function(){
			this.inherited(arguments);

			on(window, "resize", lang.hitch(this, "resize"));
		},
		resize: function(){
			if(this.chart){
				this.chart.resize();
			}
			this.inherited(arguments);
		},

		render_chart: function(){

			if(!this.chart){
				this.chart = new D3HorizontalBarChart(this.chartNode, "fnProfile");
				this.chart.render(this.data);
			}else{

				this.chart.render(this.data);
			}
		},

		render_table: function(){
			this.inherited(arguments);

			this.grid.refresh();
			this.grid.renderArray(this.data);
			this.grid.sort([{attribute: "count", descending: true}]);
		}
	})
});