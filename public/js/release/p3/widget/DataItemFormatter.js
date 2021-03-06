define("p3/widget/DataItemFormatter", [
	"dojo/_base/lang", "dojo/date/locale", "dojo/dom-construct", "dojo/dom-class",
	"dijit/form/Button", "../JobManager", "dijit/TitlePane", "./formatter"
], function(lang, locale, domConstruct, domClass,
			Button, JobManager, TitlePane, formatter){

	var formatters = {
		"default": function(item, options){
			options = options || {};

			var table = domConstruct.create("table");
			var tbody = domConstruct.create("tbody", {}, table);

			Object.keys(item).sort().forEach(function(key){
				var tr = domConstruct.create("tr", {}, tbody);
				domConstruct.create("td", {innerHTML: key}, tr);
				domConstruct.create("td", {innerHTML: item[key]}, tr);
			}, this);

			return table;
		},

		"job_parameters": function(item, options){
			function renderObject(obj, target, depth){
				if(!depth){
					depth = 1
				}
				if(typeof obj == 'object'){
					var props = Object.keys(obj);
					props.forEach(function(p){
						if(typeof obj[p] == 'object'){
							var tr = domConstruct.create("tr", {}, tbody);
							domConstruct.create("td", {
								style: {"padding-left": (depth * 5) + "px"},
								innerHTML: p,
								nowrap: "nowrap"
							}, tr);
							domConstruct.create("td", {}, tr);
							renderObject(obj[p], tbody, depth + 1);
						}else{
							var tr = domConstruct.create("tr", {}, tbody);
							domConstruct.create("td", {
								style: {"padding-left": (depth * 10) + "px"},
								innerHTML: p,
								nowrap: "nowrap"
							}, tr);
							domConstruct.create("td", {innerHTML: obj[p]}, tr);
						}
					})
				}
			}
		},
		"completed_job": function(item, options){
			options = options || {};

			var columns = [{
				name: 'App',
				text: 'app'
			}, {
				name: 'Job ID',
				text: 'id'
			}, {
				name: "Status",
				text: "status"
			}, {
				name: 'Submitted',
				text: 'submit_time'
			}, {
				name: 'Start',
				text: 'start_time'
			}, {
				name: 'Completed',
				text: 'completed_time'
			}, {
				name: "Parameters",
				text: "parameters",
				data_hide: true
			}, {
				name: "_formatterType",
				text: "_formatterType",
				data_hide: true
			}, {
				name: "Parameters",
				text: "parameters",
				data_hide: true
			}];

			var div = domConstruct.create("div");
			displayHeader(div, item.id, "fa icon-flag-checkered fa-2x", "/workspace/", options);
			displayDetail(item, columns, div, options);

			return div;
		},

		"failed_job": function(item, options){
			options = options || {};

			var columns = [{
				name: 'App',
				text: 'app'
			}, {
				name: 'Job ID',
				text: 'id'
			}, {
				name: "Status",
				text: "status"
			}, {
				name: 'Submitted',
				text: 'submit_time'
			}, {
				name: 'Start',
				text: 'start_time'
			}, {
				name: 'Completed',
				text: 'completed_time'
			}, {
				name: "Parameters",
				text: "parameters",
				data_hide: true
			}, {
				name: "_formatterType",
				text: "_formatterType",
				data_hide: true
			}, {
				name: "Parameters",
				text: "parameters",
				data_hide: true
			}];

			var div = domConstruct.create("div");
			displayHeader(div, item.id, "fa icon-flag-checkered fa-2x", "/workspace/", options);
			displayDetail(item, columns, div, options);

			var stpDiv = domConstruct.create("div", {}, div);
			var stddlg = new TitlePane({title: "Standard Output", style: "margin-bottom:5px;", open: false}, stpDiv);
			var tpDiv = domConstruct.create("div", {}, div);
			var dlg = new TitlePane({title: "Error Output", open: false}, tpDiv);
			dlg.watch("open", function(attr, oldVal, open){
				if(!open){
					return;
				}
				JobManager.queryTaskDetail(item.id, false, true).then(function(detail){
					console.log("JOB DETAIL: ", detail);
					if(detail.stderr){
						dlg.set("content", "<pre>" + detail.stderr + "</pre>");
					}else{
						dlg.set("content", "Unable to retreive STDERR of this task.<br><pre>" + JSON.stringify(detail, null, 4) + "</pre>");
					}

				}, function(err){
					dlg.set("content", "Unable to retreive additional details about this task at this task.<br>" + err + "<br><pre></pre>");
				});
			});

			stddlg.watch("open", function(attr, oldVal, open){
				if(!open){
					return;
				}
				JobManager.queryTaskDetail(item.id, true, false).then(function(detail){
					console.log("JOB DETAIL: ", detail);
					if(detail.stdout){
						stddlg.set("content", "<pre>" + detail.stdout + "</pre>");
					}else{
						stddlg.set("content", "Unable to retreive STDOUT of this task.<br><pre>" + JSON.stringify(detail, null, 4) + "</pre>");
					}

				}, function(err){
					stddlg.set("content", "Unable to retreive additional details about this task at this task.<br>" + err + "<br><pre></pre>");
				});
			});

			// displayDetailBySections(obj.parameters,"Parameters" , obj.parameters, tbody, options);

			return div;
		},

		"feature_data": function(item, options){
			options = options || {};

			var sectionList = ['Summary', 'Identifiers', 'Genome', 'Location', 'Sequences'];
			var section = {};

			section['Summary'] = [{
				name: 'RefSeq Locus Tag',
				text: 'refseq_locus_tag',
				link: 'http://www.ncbi.nlm.nih.gov/protein/?term=',
				mini: true
			}, {
				name: 'Gene Symbol',
				text: 'gene',
				mini: true
			}, {
				name: 'Product',
				text: 'product',
				mini: true
			}, {
				name: 'Annotation',
				text: 'annotation'
			}, {
				name: 'Feature Type',
				text: 'feature_type'
			}];

			section['Identifiers'] = [{
				name: 'Protein ID',
				text: 'protein_id',
				link: 'http://www.ncbi.nlm.nih.gov/protein/'
			}, {
				name: 'Gene ID',
				text: 'gene_id',
				link: 'http://www.ncbi.nlm.nih.gov/gene/?term='
			}, {
				name: 'gi',
				text: 'gi',
				link: 'http://www.ncbi.nlm.nih.gov/protein/'
			}];

			section['Genome'] = [{
				name: 'Taxon ID',
				text: 'taxon_id',
				link: '/view/Taxonomy/'
			}, {
				name: 'Genome ID',
				text: 'genome_id',
				link: "/view/Genome/"
			}, {
				name: 'Genome Name',
				text: 'genome_name',
				link: function(obj){
					return lang.replace('<a href="/view/Genome/{obj.genome_id}">{obj.genome_name}</a>', {obj: obj});
				}
			}];

			section['Location'] = [{
				name: 'Accession',
				text: 'accession'
			}, {
				name: 'Start',
				text: 'start'
			}, {
				name: 'End',
				text: 'end'
			}, {
				name: 'Strand',
				text: 'strand'
			}, {
				name: 'Location',
				text: 'location',
				mini: true
			}];

			section['Sequences'] = [{
				name: 'NA Length',
				text: 'na_length'
			}, {
				name: 'NA Sequence',
				text: 'na_sequence',
				link: function(obj){
					return obj.na_sequence.substr(0, 30) + '... ' + '<button onclick="window.open(\'/view/FASTA/dna/?in(feature_id,(' + obj.feature_id + '))\')">view</button>';
				}
			}, {
				name: 'AA Length',
				text: 'aa_length'
			}, {
				name: 'AA Sequence',
				text: 'aa_sequence',
				link: function(obj){
					return obj.aa_sequence.substr(0, 22) + '... ' + '<button onclick="window.open(\'/view/FASTA/protein/?in(feature_id,(' + obj.feature_id + '))\')">view</button>';
				}
			}];

			var label = (item.patric_id) ? item.patric_id : (item.refseq_locus_tag) ? item.refseq_locus_tag : (item.protein_id) ? item.protein_id : item.feature_id;

			var div = domConstruct.create("div");
			displayHeader(div, label, "fa icon-genome-features fa-2x", "/view/Feature/" + item.feature_id, options);

			displayDetailBySections(item, sectionList, section, div, options);

			return div;
		},

		"spgene_data": function(item, options){
			options = options || {};

			var columns = [{
				name: 'Genome Name',
				text: 'genome_name'
			}, {
				name: 'PATRIC ID',
				text: 'patric_id'
			}, {
				name: 'RefSeq Locus Tag',
				text: 'refseq_locus_tag',
				link: 'http://www.ncbi.nlm.nih.gov/gene/?term='
			}, {
				name: 'Alt Locus Tag',
				text: 'alt_locus_tag'
			}, {
				name: 'Gene',
				text: 'gene'
			}, {
				name: 'Product',
				text: 'product'
			}, {
				name: 'Property',
				text: 'property'
			}, {
				name: 'Source',
				text: 'source',
				link: function(obj){
					var link = formatter.getExternalLinks(obj.source + '_HOME');

					if(link){
						return '<a href="' + link + '" target="_blank">' + obj.source + '</a>';
					}else{
						return obj.source;
					}
				}
			}, {
				name: 'Source ID',
				text: 'source_id',
				link: function(obj){
					var link = formatter.getExternalLinks(obj.source);

					if(link){
						return '<a href="' + link + obj.source_id + '" target="_blank">' + obj.source_id + '</a>';
					}else{
						return obj.source_id;
					}
				}
			}, {
				name: 'Organism',
				text: 'organism'
			}, {
				name: 'Function',
				text: 'function'
			}, {
				name: 'Classification',
				text: 'classification'
			}, {
				name: 'Assertion',
				text: 'assertion'
			}, {
				name: 'Evidence',
				text: 'evidence'
			}, {
				name: 'PubMed',
				text: 'pmid',
				link: 'http://www.ncbi.nlm.nih.gov/pubmed/'
			}, {
				name: 'BLASP Query Coverage',
				text: 'query_coverage'
			}, {
				name: 'BLASP Subject Coverage',
				text: 'subject_coverage'
			}, {
				name: 'BLASP Identity',
				text: 'identity'
			}, {
				name: 'BLASP E-Value',
				text: 'e_value'
			}, {
				name: 'Same Species',
				text: 'same_species'
			}, {
				name: 'Same Genus',
				text: 'same_genus'
			}, {
				name: 'Same Genome',
				text: 'same_genome'
			}, {
				name: 'Taxon ID',
				text: 'taxon_id',
				link: 'http://www.ncbi.nlm.nih.gov/Taxonomy/Browser/wwwtax.cgi?id='
			}];

			var label = (item.patric_id) ? item.patric_id : (item.refseq_locus_tag) ? item.refseq_locus_tag : item.alt_locus_tag;

			var div = domConstruct.create("div");
			displayHeader(div, label, "fa icon-genome-features fa-2x", "/view/SpecialtyGene/" + item.feature_id, options);
			displayDetail(item, columns, div, options);

			return div;
		},

		"spgene_ref_data": function(item, options){
			options = options || {};

			var columns = [{
				name: 'Property',
				text: 'property',
				mini: true
			}, {
				name: 'Source',
				text: 'source',
				link: function(obj){
					var link = formatter.getExternalLinks(obj.source + '_HOME');

					if(link){
						return '<a href="' + link + '" target="_blank">' + obj.source + '</a>';
					}else{
						return obj.source;
					}
				},
				mini: true
			}, {
				name: 'Source ID',
				text: 'source_id',
				link: function(obj){
					var link = formatter.getExternalLinks(obj.source);

					if(link){
						return '<a href="' + link + obj.source_id + '" target="_blank">' + obj.source_id + '</a>';
					}else{
						return obj.source_id;
					}
				},
				mini: true
			}, {
				name: 'Gene',
				text: 'gene_name',
				mini: true
			}, {
				name: 'Organism',
				text: 'organism',
				mini: true
			}, {
				name: 'Genus',
				text: 'genus'
			}, {
				name: 'Species',
				text: 'species'
			}, {
				name: 'Locus Tag',
				text: 'locus_tag'
			}, {
				name: 'Gene ID',
				text: 'gene_id',
				link: 'http://www.ncbi.nlm.nih.gov/gene/?term=',
				mini: true
			}, {
				name: 'GI',
				text: 'gi',
				link: 'http://www.ncbi.nlm.nih.gov/protein/',
				mini: true
			}, {
				name: 'Product',
				text: 'product',
				mini: true
			}, {
				name: 'Classification',
				text: 'classification'
			}, {
				name: 'PubMed',
				text: 'pmid',
				link: 'http://www.ncbi.nlm.nih.gov/pubmed/',
				mini: true
			}, {
				name: 'Function',
				text: 'function'
			}, {
				name: 'Assertion',
				text: 'assertion'
			}];

			var div = domConstruct.create("div");
			displayDetail(item, columns, div, options);

			return div;
		},

		// this is for blast result page against "Specialty gene reference proteins(faa)"
		"specialty_genes": function(item, options){
			options = options || {};

			var columns = [{
				name: 'Database',
				text: 'database',
				link: function(obj){
					var link = formatter.getExternalLinks(obj.database + '_HOME');

					if(link){
						return '<a href="' + link + '" target="_blank">' + obj.database + '</a>';
					}else{
						return obj.database;
					}
				}
			}, {
				name: 'Source ID',
				text: 'source_id',
				link: function(obj){
					var link = formatter.getExternalLinks(obj.database);

					if(link){
						return '<a href="' + link + obj.source_id + '" target="_blank">' + obj.source_id + '</a>';
					}else{
						return obj.source_id;
					}
				}
			}, {
				name: 'Description',
				text: 'function'
			}, {
				name: 'Organism',
				text: 'organism'
			}];

			var label = item.database + ' | ' + item.source_id;

			var div = domConstruct.create("div");
			displayHeader(div, label, "fa icon-genome-features fa-2x", null, options);
			displayDetail(item, columns, div, options);

			return div;
		},

		"taxonomy_data": function(item, options){
			options = options || {};

			var columns = [{
				name: 'Taxonomy ID',
				text: 'taxon_id',
				link: 'http://www.ncbi.nlm.nih.gov/Taxonomy/Browser/wwwtax.cgi?id='
			}, {
				name: 'Rank',
				text: 'taxon_rank'
			}, {
				name: 'Lineage',
				text: 'lineage_names',
				link: function(obj){
					var ids = obj['lineage_ids'];
					return obj['lineage_names'].map(function(d, idx){
						return lang.replace('<a href="/view/Taxonomy/{0}">{1}</a>', [ids[idx], d]);
					}).join(", ");
				}
			}, {
				name: 'Genetic Code',
				text: 'genetic_code'
			}];

			var div = domConstruct.create("div");
			displayHeader(div, item.taxon_name, "fa icon-taxonomy fa-2x", "/view/Taxonomy/" + item.taxon_id, options);

			displayDetail(item, columns, div, options);

			return div;
		},

		"pathway_data": function(item, options){
			options = options || {};

			var columns = [{
				name: 'Pathway ID',
				text: 'pathway_id'
			}, {
				name: 'Pathway Name',
				text: 'pathway_name'
			}, {
				name: 'Pathway Class',
				text: 'pathway_class'
			}, {
				name: 'Annotation',
				text: 'annotation'
			}, {
				name: 'Unique Genome Count',
				text: 'genome_count'
			}, {
				name: 'Unique Gene Count',
				text: 'gene_count'
			}, {
				name: 'Unique EC Count',
				text: 'ec_count'
			}, {
				name: 'EC Conservation',
				text: 'ec_cons'
			}, {
				name: 'Gene Conservation',
				text: 'gene_cons'
			}];

			var div = domConstruct.create("div");
			displayHeader(div, item.pathway_name, "fa icon-git-pull-request fa-2x", "/view/Pathways/" + item.pathway_id, options);
			displayDetail(item, columns, div, options);

			return div;
		},

		"proteinfamily_data": function(item, options){
			options = options || {};

			var columns = [{
				name: 'ID',
				text: 'family_id'
			}, {
				name: 'Proteins',
				text: 'feature_count'
			}, {
				name: 'Genomes',
				text: 'genome_count'
			}, {
				name: 'Description',
				text: 'description'
			}, {
				name: 'Min AA Length',
				text: 'aa_length_min'
			}, {
				name: 'Max AA Length',
				text: 'aa_length_max'
			}, {
				name: 'Mean',
				text: 'aa_length_mean'
			}, {
				name: 'Std',
				text: 'aa_length_std'
			}];

			var div = domConstruct.create("div");
			displayHeader(div, item.family_id, "fa icon-tasks fa-2x", "/view/ProteinFamilies/" + item.family_id, options);
			displayDetail(item, columns, div, options);

			return div;
		},

		"msa_details": function(item, options){
			options = options || {};
			var columns = [{
				name: "No. of Members",
				text: "numFeatures"
			}, {
				name: "No. of Organisms",
				text: "numOrganisms"
			}, {
				name: "Min AA Length",
				text: "minLength"
			}, {
				name: "Max AA Length",
				text: "maxLength"
			}];
			var div = domConstruct.create("div");
			displayHeader(div, "MSA", "fa icon-alignment fa-2x", "/view/MSA/", options);
			displayDetail(item, columns, div, options);

			return div;
		},

		"sequence_data": function(item, options){
			options = options || {};

			var columns = [{
				name: 'Genome Name',
				text: 'genome_name',
				mini: true
			}, {
				name: 'Genome ID',
				text: 'genome_id'
			}, {
				name: 'Accession',
				text: 'accession'
			}, {
				name: 'Sequence ID',
				text: 'sequence_id',
				link: 'http://www.ncbi.nlm.nih.gov/nuccore/',
				mini: true
			}, {
				name: 'Length',
				text: 'length',
				mini: true
			}, {
				name: 'GC Content',
				text: 'gc_content',
				mini: true
			}, {
				name: 'Sequence Type',
				text: 'sequence_type'
			}, {
				name: 'Topology',
				text: 'topology'
			}, {
				name: 'Description',
				text: 'description'
			}, {
				name: 'Chromosome',
				text: 'chromosome'
			}, {
				name: 'Plasmid',
				text: 'plasmid'
			}, {
				name: 'GI',
				text: 'gi',
				link: 'http://www.ncbi.nlm.nih.gov/nuccore/'
			}, {
				name: 'Taxon ID',
				text: 'taxon_id',
				link: 'http://www.ncbi.nlm.nih.gov/Taxonomy/Browser/wwwtax.cgi?id='
			}, {
				name: 'Version',
				text: 'version'
			}, {
				name: 'Release Date',
				text: 'release_date'
			}];

			var div = domConstruct.create("div");
			displayHeader(div, item.sequence_id, "fa icon-contigs fa-2x", "/view/Genome/" + item.genome_id, options);
			displayDetail(item, columns, div, options);

			return div;
		},

		"transcriptomics_experiment_data": function(item, options){
			options = options || {};

			var sectionList = ['Experiment Info', 'Additional Metadata'];
			var section = {};

			section['Experiment Info'] = [{
				name: 'Experiment ID',
				text: 'eid'
			}, {
				name: 'Accession',
				text: 'accession',
				link: 'http://www.ncbi.nlm.nih.gov/geo/query/acc.cgi?acc='
			}, {
				name: 'Institution',
				text: 'institution'
			}, {
				name: 'PI',
				text: 'pi'
			}, {
				name: 'Author',
				text: 'author'
			}, {
				name: 'PubMed',
				text: 'pmid',
				link: 'http://www.ncbi.nlm.nih.gov/pubmed/'
			}, {
				name: 'Release Date',
				text: 'release_date'
			}, {
				name: 'Title',
				text: 'title'
			}, {
				name: 'Description',
				text: 'description'
			}, {
				name: 'Organism',
				text: 'organism'
			}, {
				name: 'Strain',
				text: 'strain'
			}, {
				name: 'Gene Modification',
				text: 'mutant'
			}, {
				name: 'Time Series',
				text: 'timeseries'
			}, {
				name: 'Experimental Condition',
				text: 'condition'
			}, {
				name: 'Comparisons',
				text: 'samples'
			}, {
				name: 'Platforms',
				text: 'platforms'
			}, {
				name: 'Genes',
				text: 'genes'
			}, {
				name: 'Genome IDs',
				text: 'genome_ids'
			}
			];

			section['Additional Metadata'] = [{
				name: 'Additional Metadata',
				multiValued: true,
				text: 'additional_metadata'
			}];

			var div = domConstruct.create("div");
			displayHeader(div, item.title, "fa icon-experiments fa-2x", "/view/TranscriptomicsExperiment/" + item.eid, options);
			displayDetailBySections(item, sectionList, section, div, options);

			return div;
		},

		"transcriptomics_sample_data": function(item, options){
			options = options || {};

			var columns = [{
				name: 'Sample ID',
				text: 'pid'
			}, {
				name: 'Experiment ID',
				text: 'eid'
			}, {
				name: 'Title',
				text: 'expname'
			}, {
				name: 'Samples',
				text: 'samples'
			}, {
				name: 'Genes',
				text: 'genes'
			}, {
				name: 'Significant Genes (Log Ratio)',
				text: 'sig_log_ratio'
			}, {
				name: 'Significant Genes (Z Score)',
				text: 'sig_z_score'
			}, {
				name: 'PubMed',
				text: 'pmid',
				link: 'http://www.ncbi.nlm.nih.gov/pubmed/'
			}, {
				name: 'Link Out',
				text: 'accession',
				link: 'http://www.ncbi.nlm.nih.gov/geo/query/acc.cgi?acc='
			}, {
				name: 'Organism',
				text: 'organism'
			}, {
				name: 'Strain',
				text: 'strain'
			}, {
				name: 'Gene Modification',
				text: 'mutant'
			}, {
				name: 'Experimental Condition',
				text: 'condition'
			}, {
				name: 'Time Point',
				text: 'timepoint'
			}, {
				name: 'Channels',
				text: 'channels'
			}, {
				name: 'Platform',
				text: 'platform'
			}, {
				name: 'Genome IDs',
				text: 'genome_ids'
			}, {
				name: 'Release Date',
				text: 'release_date'
			}];

			var div = domConstruct.create("div");
			displayHeader(div, item.expname, "fa icon-experiments fa-2x", "/view/TranscriptomicsComparison/" + item.pid, options);
			displayDetail(item, columns, div, options);

			return div;
		},

		"transcriptomics_gene_data": function(item, options){
			options = options || {};

			var columns = [{
				name: "Genome Name",
				text: "genome_name"
			}, {
				name: "Accession",
				text: "accession"
			}, {
				name: "PATRIC ID",
				text: "patric_id"
			}, {
				name: "RefSeq Locus Tag",
				text: "refseq_locus_tag"
			}, {
				name: "Alt Locus Tag",
				text: "alt_locus_tag"
			}, {
				name: "Gene Symbol",
				text: "gene"
			}, {
				name: "Product",
				text: "product"
			}, {
				name: "Start",
				text: "start"
			}, {
				name: "End",
				text: "end"
			}, {
				name: "Strand",
				text: "strand"
			}, {
				name: "Comparisons",
				text: "sample_size"
			}, {
				name: "Up",
				text: "up"
			}, {
				name: "Down",
				text: "down"
			}];

			var label = (item.patric_id) ? item.patric_id : (item.refseq_locus_tag) ? item.refseq_locus_tag : item.alt_locus_tag;
			var div = domConstruct.create("div");
			displayHeader(div, label, "fa icon-genome-features fa-2x", "/view/Feature/" + item.feature_id, options);
			displayDetail(item, columns, div, options);

			return div;
		},

		"interaction_data": function(item, options){
			var sectionList = ['Interaction', 'Interactor A', 'Interactor B'];
			var section = {};

			section['Interaction'] = [{
				name: 'Category',
				text: 'category'
			}, {
				name: 'Interaction Type',
				text: 'interaction_type'
			}, {
				name: 'Detection Method',
				text: 'detection_method'
			}, {
				name: 'Evidence',
				text: 'evidence'
			}, {
				name: 'Source DB',
				text: 'source_db'
			}, {
				name: 'Pubmed',
				text: 'pmid',
				link: function(obj){
					if(obj['pmid'].length > 0){
						var pmid = obj['pmid'][0];
						// console.log(pmid, typeof pmid);
						return '<a href="http://www.ncbi.nlm.nih.gov/pubmed/' + pmid.split(';').join(',') + '" target="_blank">' + pmid + '</a>';
					}else{
						return '';
					}
				}
			}, {
				name: 'Score',
				text: 'score'
			}];

			section['Interactor A'] = [{
				name: 'Interactor',
				text: 'interactor_a',
				link: function(obj){
					return '<a href="/view/Feature/' + obj['feature_id_a'] + '">' + obj['interactor_a'] + '</a>';
				}
			}, {
				name: 'Description',
				text: 'interactor_desc_a'
			}, {
				name: 'Type',
				text: 'interactor_type_a'
			}, {
				name: 'Genome Name',
				text: 'genome_name_a'
			}, {
				name: 'Refseq Locus Tag',
				text: 'refseq_locus_tag_a',
				link: 'http://www.ncbi.nlm.nih.gov/protein/?term='
			}, {
				name: 'gene',
				text: 'gene_a'
			}];

			section['Interactor B'] = [{
				name: 'Interactor',
				text: 'interactor_b',
				link: function(obj){
					return '<a href="/view/Feature/' + obj['feature_id_b'] + '">' + obj['interactor_b'] + '</a>';
				}
			}, {
				name: 'Description',
				text: 'interactor_desc_b'
			}, {
				name: 'Type',
				text: 'interactor_type_b'
			}, {
				name: 'Genome Name',
				text: 'genome_name_b'
			}, {
				name: 'Refseq Locus Tag',
				text: 'refseq_locus_tag_b',
				link: 'http://www.ncbi.nlm.nih.gov/protein/?term='
			}, {
				name: 'gene',
				text: 'gene_b'
			}];

			var div = domConstruct.create("div");

			displayDetailBySections(item, sectionList, section, div, options);

			return div;
		},

		"genome_amr_data": function(item, options){
			var sectionList = ['Summary', 'Measurement', 'Laboratory typing'];
			var section = {};

			section['Summary'] = [{
				name: 'Taxon ID',
				text: 'taxon_id'
			}, {
				name: 'Genome ID',
				text: 'genome_id'
			}, {
				name: 'Genome Name',
				text: 'genome_name'
			}, {
				name: 'Antibiotic',
				text: 'antibiotic'
			}, {
				name: 'Resistant Phenotype',
				text: 'resistant_phenotype'
			}, {
				name: 'Testing Standard',
				text: 'testing_standard'
			}, {
				name: 'Testing Standard Year',
				text: 'testing_standard_year'
			}];

			section['Measurement'] = [{
				name: 'Sign',
				text: 'measurement_sign'
			}, {
				name: 'Value',
				text: 'measurement_value'
			}, {
				name: 'Units',
				text: 'measurement_unit'
			}];

			section['Laboratory typing'] = [{
				name: 'Method',
				text: 'laboratory_typing_method'
			}, {
				name: 'Platform',
				text: 'laboratory_typing_platform'
			}, {
				name: 'Vendor',
				text: 'vendor'
			}, {
				name: 'Version',
				text: 'laboratory_typing_method_version'
			}];

			var div = domConstruct.create("div");

			displayDetailBySections(item, sectionList, section, div, options);

			return div;
		},

		"antibiotic_data": function(item, options){
			options = options || {};

			var columns = [{
				name: 'Antibiotic Name',
				text: 'antibiotic_name'
			}, {
				name: 'PubChem CID',
				text: 'pubchem_cid',
				link: 'https://pubchem.ncbi.nlm.nih.gov/compound/'
			}, {
				name: 'CAS ID',
				text: 'cas_id'
			}, {
				name: 'Molecular Formula',
				text: 'molecular_formula',
				link: 'https://pubchem.ncbi.nlm.nih.gov/search/#collection=compounds&query_type=mf&sort=mw&sort_dir=asc&query='
			}, {
				name: 'Molecular Weight',
				text: 'molecular_weight'
			}, {
				name: 'InChI Key',
				text: 'inchi_key'
			}, {
				name: 'ATC Classification',
				text: 'atc_classification',
				link: function(obj){
					return obj['atc_classification'].map(function(cls){
						return '<div class="keyword small">' + cls + '</div>';
					}).join(' ')
				}
			}];

			var div = domConstruct.create("div");
			displayDetail(item, columns, div, options);

			return div;
		},

		"genome_data": function(item, options){
			options = options || {};

			var metadataGenomeSummaryID = ['Organism Info', 'Isolate Info', 'Host Info', 'Sequence Info', 'Phenotype Info', 'Project Info', 'Others'];
			var metadataGenomeSummaryValue = {};
			metadataGenomeSummaryValue['Organism Info'] = [{
				name: 'Genome ID',
				text: 'genome_id',
				mini: true
			}, {
				name: 'Genome Name',
				text: 'genome_name',
				mini: true
			}, {
				name: 'NCBI Taxon ID',
				text: 'taxon_id',
				link: 'http://www.ncbi.nlm.nih.gov/Taxonomy/Browser/wwwtax.cgi?id='
			}, {
				name: 'Genome Status',
				text: 'genome_status',
				mini: true
			}, {
				name: 'Strain',
				text: 'strain'
			}, {
				name: 'Serovar',
				text: 'serovar'
			}, {
				name: 'Biovar',
				text: 'biovar'
			}, {
				name: 'Pathovar',
				text: 'pathovar'
			}, {
				name: 'MLST',
				text: 'mlst'
			}, {
				name: 'Other Typing',
				text: 'other_typing'
			}, {
				name: 'Culture Collection',
				text: 'culture_collection'
			}, {
				name: 'Type Strain',
				text: 'type_strain'
			}, {
				name: 'Antimicrobial Resistance',
				text: 'antimicrobial_resistance'
			}, {
				name: 'Antimicrobial Resistance Evidence',
				text: 'antimicrobial_resistance_evidence'
			}, {
				name: 'Reference Genome',
				text: 'reference_genome'
			}];

			metadataGenomeSummaryValue['Project Info'] = [{
				name: 'Sequencing Center',
				text: 'sequencing_centers'
			}, {
				name: 'Completion Date',
				text: 'completion_date'
			}, {
				name: 'Publication',
				text: 'publication',
				link: 'http://www.ncbi.nlm.nih.gov/pubmed/'
			}, {
				name: 'BioProject Accession',
				text: 'bioproject_accession',
				link: 'http://www.ncbi.nlm.nih.gov/bioproject/?term=',
				mini: true
			}, {
				name: 'BioSample Accession',
				text: 'biosample_accession',
				link: 'http://www.ncbi.nlm.nih.gov/biosample/',
				mini: true
			}, {
				name: 'Assembly Accession',
				text: 'assembly_accession',
				link: 'http://www.ncbi.nlm.nih.gov/assembly/'
			}, {
				name: "SRA Accession",
				text: "sra_accession",
				link: function(obj){
					return lang.replace('<a href="http://www.ncbi.nlm.nih.gov/sra/?term={1}" target="_blank">{0}</a>',
						[obj['sra_accession'], obj['sra_accession'].split(',').join("+OR+")]);
				}
			}, {
				name: 'GenBank Accessions',
				text: 'genbank_accessions',
				link: 'http://www.ncbi.nlm.nih.gov/nuccore/'
			}, {
				name: 'RefSeq Accessions',
				text: 'refseq_accessions',
				link: 'http://www.ncbi.nlm.nih.gov/nuccore/'
			}];

			metadataGenomeSummaryValue['Sequence Info'] = [{
				name: 'Sequencing Status',
				text: 'sequencing_status'
			}, {
				name: 'Sequencing Platform',
				text: 'sequencing_platform'
			}, {
				name: 'Sequencing Depth',
				text: 'sequencing_depth'
			}, {
				name: 'Assembly Method',
				text: 'assembly_method'
			}, {
				name: 'Chromosomes',
				text: 'chromosomes'
			}, {
				name: 'Plasmids',
				text: 'plasmids'
			}, {
				name: 'Contigs',
				text: 'contigs'
			}, {
				name: 'Sequences',
				text: 'sequences',
				link: function(obj){
					return lang.replace('<a href="/view/Genome/{obj.genome_id}#view_tab=sequences">{obj.sequences}</a>', {obj: obj});
				}
			}, {
				name: 'Genome Length',
				text: 'genome_length'
			}, {
				name: 'GC Content',
				text: 'gc_content'
			}, {
				name: 'PATRIC CDS',
				text: 'patric_cds',
				link: function(obj){
					return lang.replace('<a href="/view/Genome/{obj.genome_id}#view_tab=features&filter=and(eq(feature_type,CDS),eq(annotation,PATRIC))">{obj.patric_cds}</a>', {obj: obj});
				}
			}, {
				name: 'RefSeq CDS',
				text: 'refseq_cds'
			}];

			metadataGenomeSummaryValue['Isolate Info'] = [{
				name: 'Isolation Site',
				text: 'isolation_site'
			}, {
				name: 'Isolation Source',
				text: 'isolation_source'
			}, {
				name: 'Isolation Comments',
				text: 'isolation_comments'
			}, {
				name: 'Collection Year',
				text: 'collection_year'
			}, {
				name: 'Collection Date',
				text: 'collection_date'
			}, {
				name: 'Isolation Country',
				text: 'isolation_country'
			}, {
				name: 'Geographic Location',
				text: 'geographic_location'
			}, {
				name: 'Latitude',
				text: 'latitude'
			}, {
				name: 'Longitude',
				text: 'longitude'
			}, {
				name: 'Altitude',
				text: 'altitude'
			}, {
				name: 'Depth',
				text: 'depth'
			}, {
				name: 'Other Environmental',
				text: 'other_environmental'
			}];

			metadataGenomeSummaryValue['Host Info'] = [{
				name: 'Host Name',
				text: 'host_name'
			}, {
				name: 'Host Gender',
				text: 'host_gender'
			}, {
				name: 'Host Age',
				text: 'host_age'
			}, {
				name: 'Host Health',
				text: 'host_health'
			}, {
				name: 'Body Sample Site',
				text: 'body_sample_site'
			}, {
				name: 'Body Sample Subsite',
				text: 'body_sample_subsite'
			}, {
				name: 'Other Clinical',
				text: 'other_clinical'
			}];

			metadataGenomeSummaryValue['Phenotype Info'] = [{
				name: 'Gram Stain',
				text: 'gram_stain'
			}, {
				name: 'Cell Shape',
				text: 'cell_shape'
			}, {
				name: 'Motility',
				text: 'motility'
			}, {
				name: 'Sporulation',
				text: 'sporulation'
			}, {
				name: 'Temperature Range',
				text: 'temperature_range'
			}, {
				name: 'Optimal Temperature',
				text: 'optimal_temperature'
			}, {
				name: 'Salinity',
				text: 'salinity'
			}, {
				name: 'Oxygen Requirement',
				text: 'oxygen_requirement'
			}, {
				name: 'Habitat',
				text: 'habitat'
			}, {
				name: 'Disease',
				text: 'disease'
			}];

			metadataGenomeSummaryValue['Others'] = [{
				name: 'Comments',
				text: 'comments'
			}, {
				name: 'Additional Metadata',
				text: 'additional_metadata'
			}];

			var div = domConstruct.create("div");
			displayHeader(div, item.genome_name, "fa icon-genome fa-2x", "/view/Genome/" + item.genome_id, options);

			var summary = "Length: " + item.genome_length + "bp, Chromosomes: " + (item.chromosomes || 0) + ", Plasmids: " + (item.plasmids || 0) + ", Contigs: " + (item.contigs || 0);

			domConstruct.create("div", {
				innerHTML: summary,
				"class": "DataItemSummary",
				nowrap: "nowrap"
			}, div);

			displayDetailBySections(item, metadataGenomeSummaryID, metadataGenomeSummaryValue, div, options);

			return div;
		}
	};

	function displayHeader(parent, label, iconClass, url, options){
		var linkTitle = options && options.linkTitle || false;

		var titleDiv = domConstruct.create("div", {"class": "DataItemHeader"}, parent);

		// span icon
		domConstruct.create("span", {"class": iconClass}, titleDiv);

		// span label
		domConstruct.create("span", {
			innerHTML: (linkTitle) ? lang.replace('<a href="{url}">{label}</a>', {url: url, label: label}) : label
		}, titleDiv);
	}

	function displayDetailBySections(item, sections, meta_data, parent, options){

		var mini = options && options.mini || false;

		var table = domConstruct.create("table", {}, parent);
		var tbody = domConstruct.create("tbody", {}, table);

		sections.forEach(function(section){
			if(!mini){
				var header = renderSectionHeader(section);
				domConstruct.place(header, tbody);
			}

			meta_data[section].forEach(function(column){
				var row = renderProperty(column, item, options);
				if(row){
					domConstruct.place(row, tbody);
				}
			})
		})
	}

	function displayDetail(item, columns, parent, options){

		var table = domConstruct.create("table", {}, parent);
		var tbody = domConstruct.create("tbody", {}, table);

		columns.forEach(function(column){
			var row = renderProperty(column, item, options);
			if(row){
				domConstruct.place(row, tbody);
			}
		})
	}

	function renderProperty(column, item, options){
		var key = column.text;
		var label = column.name;
		var multiValued = column.multiValued || false;
		var mini = options && options.mini || false;

		if(key && item[key] && !column.data_hide){
			if(multiValued){
				var tr = domConstruct.create("tr", {});
				var td = domConstruct.create("td", {colspan: 2}, tr);

				domConstruct.place(renderDataTable(item[key]), td);
				return tr;
			}
			else if(!mini || column.mini){
				var l = evaluateLink(column.link, item[key], item);
				return renderRow(label, l);
			}
		}
	}

	function evaluateLink(link, value, item){
		return (link && value !== "-" && value !== "0") ? (
			(typeof(link) == "function") ? link.apply(this, [item]) : '<a href="' + link + value + '" target="_blank">' + value + '</a>'
		) : value;
	}

	function renderSectionHeader(title){
		var tr = domConstruct.create("tr", {});
		domConstruct.create("td", {
			innerHTML: title,
			"class": "DataItemSectionHead",
			colspan: 2
		}, tr);

		return tr;
	}

	function renderRow(property, value){
		var tr = domConstruct.create("tr", {});
		domConstruct.create("td", {
			"class": "DataItemProperty",
			innerHTML: property
		}, tr);
		domConstruct.create("td", {
			"class": "DataItemValue",
			innerHTML: value
		}, tr);

		return tr;
	}

	function renderDataTable(data){
		var table = domConstruct.create("table", {"class": "p3table"});
		for (var i = 0, len = data.length; i < len; i++){
			var k = data[i].split(':')[0], v = data[i].split(':')[1];

			var tr = domConstruct.create("tr", {}, table);
			domConstruct.create("td", {"class": "DataItemProperty", innerHTML: k}, tr);
			domConstruct.create("td", {"class": "DataItemValue", innerHTML: v}, tr);
		}
		return table;
	}

	return function(item, type, options){

		var new_type;
		switch(type){
			case "genome_group":
				new_type = "genome_data";
				break;
			case "feature_group":
				new_type = "feature_data";
				break;
			case "experiment":
				new_type = "transcriptomics_sample_data";
				break;
			default:
				new_type = (formatters[type]) ? type : "default";
			// console.log("display in " + new_type + " format");
		}

		return formatters[new_type](item, options);
	}
});
