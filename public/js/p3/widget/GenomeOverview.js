define([
	"dojo/_base/declare", "dojo/_base/lang", "dojo/on", "dojo/request", "dojo/topic",
	"dojo/dom-class", "dojo/query", "dojo/dom-style", "dojo/text!./templates/GenomeOverview.html", "dojo/dom-construct",
	"dijit/_WidgetBase", "dijit/_TemplatedMixin", "dijit/_WidgetsInTemplateMixin", "dijit/Dialog",
	"../util/PathJoin", "./SelectionToGroup", "./GenomeFeatureSummary", "./DataItemFormatter",
	"./ExternalItemFormatter", "./AdvancedDownload"

], function(declare, lang, on, xhr, Topic,
			domClass, domQuery, domStyle, Template, domConstruct,
			WidgetBase, Templated, _WidgetsInTemplateMixin, Dialog,
			PathJoin, SelectionToGroup, GenomeFeatureSummary, DataItemFormatter,
			ExternalItemFormatter, AdvancedDownload){

	return declare([WidgetBase, Templated, _WidgetsInTemplateMixin], {
		baseClass: "GenomeOverview",
		disabled: false,
		templateString: Template,
		apiServiceUrl: window.App.dataAPI,
		genome: null,
		state: null,

		_setStateAttr: function(state){
			this._set("state", state);
			if(state.genome){
				this.set("genome", state.genome);
			}
		},

		"_setGenomeAttr": function(genome){
			if(this.genome && (this.genome.genome_id == genome.genome_id)){
				// console.log("Genome ID Already Set")
				return;
			}
			this.genome = genome;

			this.createSummary(genome);

			var sumWidgets = ["apSummaryWidget", "gfSummaryWidget", "pfSummaryWidget", "spgSummaryWidget"];

			sumWidgets.forEach(function(w){
				if(this[w]){
					this[w].set('query', "eq(genome_id," + this.genome.genome_id + ")")
				}
			}, this);

			// display/hide download button per public status
			if(genome['public']){
				domStyle.set(domQuery("div.ActionButtonWrapper.btnDownloadGenome")[0], "display", "inline-block");
			}else{
				// private, hide button
				domStyle.set(domQuery("div.ActionButtonWrapper.btnDownloadGenome")[0], "display", "none");
			}
		},

		"createSummary": function(genome){
			domConstruct.empty(this.genomeSummaryNode);
			domConstruct.place(DataItemFormatter(genome, "genome_data", {}), this.genomeSummaryNode, "first");
			domConstruct.empty(this.pubmedSummaryNode);
			domConstruct.place(ExternalItemFormatter(genome, "pubmed_data", {}), this.pubmedSummaryNode, "first");
		},

		onAddGenome: function(){

			if(!window.App.user || !window.App.user.id){
				Topic.publish("/login");
				return;
			}

			var dlg = new Dialog({title: "Add This Genome To Group"});
			var stg = new SelectionToGroup({
				selection: [this.genome],
				type: 'genome_group'
			});
			on(dlg.domNode, "dialogAction", function(){
				dlg.hide();
				setTimeout(function(){
					dlg.destroy();
				}, 2000);
			});
			domConstruct.place(stg.domNode, dlg.containerNode, "first");
			stg.startup();
			dlg.startup();
			dlg.show();
		},

		onDownload: function(){

			var dialog = new Dialog({title: "Download"});
			var advDn = new AdvancedDownload({selection: [this.genome], containerType: "genome_data"});
			domConstruct.place(advDn.domNode, dialog.containerNode);
			dialog.show();
		},

		startup: function(){
			if(this._started){
				return;
			}
			this.inherited(arguments);

			if(this.genome){
				this.set("genome", this.genome);
			}
		}
	});
});
