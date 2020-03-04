'use strict'

angular.module("specta")
	.controller("customReportCtrl", customReport);
	customReport.$inject = ['$scope', '$state', '$stateParams', '$timeout', 'globalConfig', 'ChartService', 'httpService', 'dbService','SweetAlert'];
	function customReport($scope, $state, $stateParams, $timeout, globalConfig, ChartService, httpService, dbService ,SweetAlert, currentUser){
		$scope.data = {};
		$scope.query = {};
		$scope.DateFilterType = false;
		$scope.loader = false;

		$scope.selFilter = "";
		$scope.selectedColumn = "";
		$scope.viewOptions = [
			{ id:'Raw Data', label: 'Raw Data'},
			{ id:'Count Of Row', label: 'Count Of Row'},
			{ id:'Sum Of', label:'Sum Of...'},
			{ id:'Average Of', label:'Average Of...'},
			{ id:'Number of distinct values of', label:'Number of distinct values of...'},
			{ id:'Cumulative sum of', label:'Cumulative sum of...'},
			{ id: 'Cumulative count of rows', label : 'Cumulative count of rows...'},
			{ id: 'Minimum of', label : 'Minimum of...'},
			{ id: 'Maximum of', label : 'Maximum of...'}
		];
		$scope.view = $scope.viewOptions[0].id;

		$scope.tableList = [];
    	$scope.selectedItem = $scope.tableList[0];
    	$scope.validationMessage;

		// click event Function 
		$scope.changedDB = changedDB;
		$scope.selectedFilter = selectedFilter;
		$scope.addFilter = addFilter;
		$scope.selectedViewFields = selectedViewFields;
		$scope.selectedGroupby = selectedGroupby;
		$scope.removeGroupby = removeGroupby;
		$scope.selectedSorting = selectedSorting;
		$scope.selectedOrder = selectedOrder;
		$scope.removeFilter = removeFilter;
		$scope.removeGroupView = removeGroupView;
		$scope.removeSorting = removeSorting;
		$scope.closeDropDown = closeDropDown;
		
		$scope.closeFilterPopUp = closeFilterPopUp;
		$scope.selectedViewData = selectedViewData;
		$scope.rowLimit = rowLimit;
		$scope.reset = reset;

		$scope.submitQuery = submitQuery;
		$scope.changeDisplayMode = changeDisplayMode;
		$scope.closeDisplayPopUp = closeDisplayPopUp;
		$scope.displaylineChart = displaylineChart;
		$scope.selectedRecorddate = selectedRecorddate;
		$scope.saveQueryToggle = saveQueryToggle;
		$scope.savequery = savequery;
		$scope.fieldSelect = fieldSelect;
		// init function call

		if($stateParams.id == '')
			$state.current.data.currentPage = 'Create Report';
		else{
			var query = '{_id: ObjectId("'+$stateParams.id+'")}';
	        var params = 'query=' + encodeURIComponent(query);
	        var url = dbService.makeUrl({collection: 'customreport', op:'select', params: params});
	        httpService.get(url).then(function(response){
	            var tmpData = response.data[0];
	            $state.current.data.currentPage = tmpData.name; //For Heading menu Active class setting
	            
	            $scope.query.name = tmpData.name;
	            $scope.query.description = tmpData.description;
	            $scope.collection = tmpData.collection;
	            changedDB($scope.collection);

	            $timeout(function(){
	            	$scope.filterList = tmpData.filterList;
		            $scope.groupbyList = tmpData.groupbyList;
		            $scope.view = tmpData.view;
		            $scope.viewList = tmpData.viewList;
		            $scope.sortingList = tmpData.sortingList;
		            $scope.limit = tmpData.limit;
		            searchQuery(tmpData.query);
	            }, 1000);
	            
			});
		}

		// Bindable Functoin Defination
		function getTableList(){
		 	httpService.get(globalConfig.pulldatabyRlistener +"getcollections").then(function(response){
				$scope.DbList = response.data;
			});
		}
		getTableList();

		function changedDB(table){
			$scope.tableList = [];
			closeFilterPopUp('hide');
			if(table){
				httpService.get(globalConfig.pulldatabyRlistener+ "getcolumns&collection="+table).then(function(response){
					var tmp = _.filter(response.data, function(item){
						return item.key != '_id';
					});
					$scope.tableList = tmp;
					$scope.filterList = [];
					$scope.viewList = [];
					$scope.sortingList = [];
					createSortList();
				});
			}
		}

		// Filter
		function selectedFilter(filter){
			$scope.data = {};
			$scope.validationMessage = null;
			filter = jQuery.parseJSON(filter);
			if(filter != null){
				$scope.selFilter = filter.type;
				$scope.selectedColumn = filter.key;
				$('#filter').show();	
			}
		}

		$scope.filterList =[];
		function addFilter(filter){
			//console.log($scope.selFilter, filter);
			if($scope.selFilter == 'ObjectId' || $scope.selFilter == 'org.bson.Document'){
				if(filter.txtFilter == undefined || filter.rdFilter == undefined || filter.txtFilter == '' || filter.rdFilter == ''){
					$scope.validationMessage  = "Please select Filter And Enter Filter Value";
					return false;
				}
			}
			else if($scope.selFilter == 'String'){
				if(filter.txtFilter == undefined || filter.rdFilter == undefined || filter.txtFilter == '' || filter.rdFilter == ''){
					$scope.validationMessage  = "Please select Filter And Enter Filter Value";
					return false;
				}
			}
			else if($scope.selFilter == 'Integer' || $scope.selFilter == 'Long'){
				if(filter.txtFilter == undefined || filter.rdFilter == undefined || filter.txtFilter == '' || filter.rdFilter == ''){
					$scope.validationMessage  = "Please select Filter And Enter Filter Value";
					return false;
				}

			}
			else if($scope.selFilter == 'Date'){
				filter.rdFilter = $scope.selFilter;
				if( filter.txtFilter == null)
					$scope.validationMessage = "Plese select date";
				else
					$scope.validationMessage = null;
			}
			
			if( filter.rdFilter != null){
				$('#filter').toggle();
				var temp = false;
				var filterObject = {'filter':filter.rdFilter,'column':$scope.selectedColumn,'value':filter.txtFilter};
				if($scope.filterList.length > 0){
					for(var i=0; i<$scope.filterList.length; i++){
						if($scope.filterList[i].column == $scope.selectedColumn){
							if(filter.rdFilter=='Between'){
								if(filter.txtFilter == undefined || filter.txtFilter2 == undefined || filter.txtFilter == '' || filter.txtFilter2 == '')
									$scope.validationMessage = "Plese select Filter Type and Filter Value";
								else{
									$scope.filterList[i] = {'filter':filter.rdFilter,'column':$scope.selectedColumn,'value':filter.txtFilter,'value2':filter.txtFilter2, 'type': $scope.selFilter};
									temp =true;
								}
							}
							else{
								$scope.filterList[i] = {'filter':filter.rdFilter,'column':$scope.selectedColumn,'value':filter.txtFilter, 'type': $scope.selFilter};
								temp =true;	
							}
						}
					}
					if(temp!= true){
						if(filter.rdFilter=='Between'){
							if(filter.txtFilter == undefined || filter.txtFilter2 == undefined || filter.txtFilter == '' || filter.txtFilter2 == '')
								$scope.validationMessage = "Plese select Filter Type and Filter Value";
							else
								$scope.filterList.push({'filter':filter.rdFilter,'column':$scope.selectedColumn,'value':filter.txtFilter,'value2':filter.txtFilter2, 'type': $scope.selFilter});
						}
						else
							$scope.filterList.push({'filter':filter.rdFilter,'column':$scope.selectedColumn,'value':filter.txtFilter, 'type': $scope.selFilter});
					}
				}
				else{
					if(filter.rdFilter=='Between')
						$scope.filterList.push({'filter':filter.rdFilter,'column':$scope.selectedColumn,'value':filter.txtFilter,'value2':filter.txtFilter2, 'type': $scope.selFilter});
					else
						$scope.filterList.push({'filter':filter.rdFilter,'column':$scope.selectedColumn,'value':filter.txtFilter, 'type': $scope.selFilter});
				}
				$scope.selectedItem = "";
				$scope.data ="";
				$scope.validationMessage = "";
			}
		}

		// close popup on close click
		function closeFilterPopUp(toggle){
			if(toggle == 'hide')
				$('#filter').hide();
			else
				$('#filter').toggle();

			$scope.selectedItem = null;
		}

		// remove Filter From List 
		function removeFilter(selectedFilter){
			var index = $scope.filterList.indexOf(selectedFilter);
			$scope.filterList.splice(index,1);
		}

		function selectedViewData(item){
		 	$scope.selectedView = item;
		 	$scope.groupSelected = true;
		 	//$("#groupbyraw").toggle(); //removed
			$scope.selectedViewingList = [];
			if(item == 'Raw Data' || item == 'Count Of Row' || item =='Cumulative count of rows'){
				//$scope.selectedViewingList = $scope.tableList;
				$scope.viewList = [];
			}
			else if(item == 'Sum Of' || item == 'Average Of' || item == 'Cumulative sum of' || item == 'Minimum of' || item == 'Maximum of' || item == 'Number of distinct values of'){
				$scope.selectedViewingList = _.filter($scope.tableList, function(item){
					return item.type == "Integer" || item.type == "Long" || item.type == "Decimal" || item.type == "Double" || item.type == "Float";
				});
				/*for(var i=0;i<$scope.tableList.length;i++)
				{
					if($scope.tableList[i].type == "Integer")
					{
						$scope.selectedViewingList.push($scope.tableList[i]);
					}
				}*/
			}

			if(item == 'Raw Data' || item == 'Cumulative sum of' || item =='Cumulative count of rows'){
				$scope.groupby = null;
				$scope.groupbyList = [];
			}
			createSortList();
		}

		function selectedViewFields(group){
			$scope.groupSelected = false;
			$scope.viewList = [];
			var selectedViewData = {'key':group.key,'type':group.type }
			selectedViewData.viewData = $scope.view;
			/*if($scope.viewList.length > 0)
			{
				var temp = false;
				for(var i = 0; i<$scope.viewList.length;i++)
				{
					if(temp == false)
					{
						if(selectedViewData.viewData == $scope.viewList[i].viewData)
						{
							console.log(group.viewData);
							if(selectedViewData.type == $scope.viewList[i].type)
							{
								if(selectedViewData.key == $scope.viewList[i].key)
								{
									temp = true;
									console.log(temp);
									$scope.group = null;	
								}
							}
						}
					}	
				}
				if(temp != true)
				{
					$scope.viewList.push(selectedViewData); 
				}
			}
			else
			{*/
				$scope.viewList.push(selectedViewData);
				createSortList();
			//}
		}

		function createSortList(){
			$scope.sortList = [];
			$scope.sortingList = [];
			_.forEach($scope.viewList, function(item){
				var key = null;
				if(item.viewData == 'Sum Of' || item.viewData == 'Cumulative sum of')
					key = 'sum';
				else if(item.viewData == 'Average Of')
					key = 'avg';
				else if(item.viewData == 'Number of distinct values of')
					key = 'count';
				else if(item.viewData == 'Minimum of')
					key = 'min';
				else if(item.viewData == 'Maximum of')
					key = 'max';

				$scope.sortList.push({key: key});
			});

			_.forEach($scope.groupbyList, function(item){
				var key = $scope.sortList.indexOf({key: item.key});
				console.log(key, item.key, $scope.sortList);
				if(key == -1)
					$scope.sortList.push({key: item.key});
			});

			if($scope.sortList.length == 0){
				_.forEach($scope.tableList, function(item){
					$scope.sortList.push({key: item.key});
				});
			}
		}

		function removeGroupView(selectedViewing){
			$scope.view = 'Raw Data';
			var index = $scope.filterList.indexOf(selectedViewing);
			$scope.viewList.splice(index,1);
			createSortList();
		}

		//Group by
		$scope.groupbyList = [];
		function selectedGroupby(group){
			if(group == null)return false;

			var index = $scope.groupbyList.indexOf(group);
			if(index == -1){
				$scope.groupbyList.push(group);
				createSortList();
			}

			if(group.key == 'recorddate')
				$('#recorddate').toggle();
			else
				$('#recorddate').hide();
		}

		function selectedRecorddate(item){
			$scope.recorddate = item;
			$('#recorddate').toggle();
		}

		function removeGroupby(item){
			var index = $scope.groupbyList.indexOf(item);
			$scope.groupbyList.splice(index,1);
			createSortList();

			if(item.key == 'recorddate')
				$scope.recorddate = '';
		}

		// Sorting
		$scope.sortingList = [];
		function selectedSorting(sorting){
			var index = $scope.sortingList.indexOf(sorting);
			if(index == -1){
				$scope.sortingList.push(sorting);
				$('#sorting').toggle();
			}
			else
				$('#sorting').toggle();

			//$scope.group = "";
		}

		function selectedOrder(sorting, sortOrderType){
			var index = $scope.sortingList.indexOf(sorting);
			$scope.sortingList[index].sorting = sortOrderType;
			$('#sorting').toggle();
			$scope.sorting = "";
			$scope.sortOrderType = "";
		}

		function removeSorting(selectedSorting){
			var index = $scope.sortingList.indexOf(selectedSorting);
			$scope.sortingList.splice(index, 1);
		}

		function closeDropDown(dropdown){
			if(dropdown == '0')
				$('#filter').toggle();
			else if(dropdown == 'recorddate')
				$('#recorddate').toggle();
			else
				$('#sorting').toggle();
		}

		function rowLimit(){
			$("#rowLimit").toggle();
		}

		function fieldSelect(){
			$("#fieldSelect").toggle();	
		}

		function reset(){
			$scope.data.txtFilter = null;
			$scope.data.rdFilter = '';
		}

		//For Daterange Picker
		//var start = moment().subtract(29, 'days');
		var start = moment();
	    var end = moment();
	    function cb(start, end){
	        $('#daterange span').html(start.format('MMMM D, YYYY') + ' - ' + end.format('MMMM D, YYYY'));
	    }

	    $('#daterange').daterangepicker({
	    	locale: {format: 'YYYY-MM-DD'},
	    	applyClass : 'btn-primary',
	        startDate: start,
	        endDate: end,
	        ranges: {
	           'Today': [moment(), moment()],
	           'Yesterday': [moment().subtract(1, 'days'), moment().subtract(1, 'days')],
	           'Last 7 Days': [moment().subtract(6, 'days'), moment()],
	           'Last 30 Days': [moment().subtract(29, 'days'), moment()],
	           'This Month': [moment().startOf('month'), moment().endOf('month')],
	           'Last Month': [moment().subtract(1, 'month').startOf('month'), moment().subtract(1, 'month').endOf('month')]
	        }
	    }, cb);
	    cb(start, end);
	    /***End Daterange Picker*/

	    function buildQuery(cb){
	    	/****For Filter***/
			var tmpFilter = {};
			var tmpFilterArr = angular.copy($scope.filterList);
			_.forEach(tmpFilterArr, function(item, key){
				if(item.type == 'Integer'){
					item.value = parseInt(item.value);
					if(item.filter == 'Equal')
						tmpFilter[item.column] = {$eq:item.value};
					else if( item.filter == 'NotEqual')
						tmpFilter[item.column] = {$ne:item.value};
					else if( item.filter == 'GreaterThan')
						tmpFilter[item.column] = {$gt:item.value};
					else if( item.filter == 'LessThan')
						tmpFilter[item.column] = {$lt:item.value};
					else if( item.filter == 'Between')
						tmpFilter[item.column] = {$gte:item.txtFilter, $lte:item.txtFilter2};
				}
				else if(item.type == 'String'){
					if(item.filter == 'Equal')
						tmpFilter[item.column] = item.value;
					else if( item.filter == 'NotEqual')
						tmpFilter[item.column] = {$ne:item.value};
					else if( item.filter == 'Contains')
						tmpFilter[item.column] = '/'+item.value+'/';
					else if( item.filter == 'NotContains')
						tmpFilter[item.column] = {$not:'/'+item.value+'/'};
					else if( item.filter == 'StartsWith')
						tmpFilter[item.column] = "/^" + item.value + "/";
					else if( item.filter == 'EndsWith')
						tmpFilter[item.column] = "/"+ item.value +"^/";

					// tmpFilter = JSON.stringify(tmpFilter);
					// if( item.filter == 'Contains' ||  item.filter == 'NotContains' ||  item.filter == 'StartsWith' || item.filter == 'EndsWith')
					// 	tmpFilter = tmpFilter.replace(/\"/g, "");
				}
				else if(item.type == 'Date'){
					var tmpdate = item.value.split(' - ');
					tmpFilter[item.column] = {$gte: "ISODate('"+tmpdate[0]+"T00:00:00.000Z')", $lte: "ISODate('"+tmpdate[1]+"T00:00:00.000Z')"};
				}
			});

			tmpFilter = JSON.stringify(tmpFilter);
			tmpFilter = tmpFilter.replace(/\"/g, "'");
			tmpFilter = tmpFilter.replace(/\/'/g, "/");
			tmpFilter = tmpFilter.replace(/\'ISODate/g, "ISODate");
			tmpFilter = tmpFilter.replace(/\)'/g, ")");
			//tmpFilter = tmpFilter.replace(/\'/^/g, "/^");

			var columns = [];
			/****For View***/
			var tmpView = '';
			var tmpPrjct = '';
			if( $scope.view == 'Count Of Row' || $scope.view == 'Cumulative count of rows'){
				tmpView = "count: {$sum:1}";
				tmpPrjct = "count:1";
			}
			else{
				var tmpViewList = angular.copy($scope.viewList);
				_.forEach(tmpViewList, function(item, key){
					if(item.viewData == 'Sum Of' || item.viewData == 'Cumulative sum of'){
						tmpView = "sum: {$sum:'$"+item.key+"'}";
						tmpPrjct = "sum:1";
						columns.push('sum');
					}
					else if(item.viewData == 'Average Of'){
						tmpView = "avg: {$avg:'$"+item.key+"'}";
						tmpPrjct = "avg:1";
						columns.push('avg');
					}
					else if(item.viewData == 'Number of distinct values of'){
						tmpView = "count: {$addToSet:'$"+item.key+"'}";
						tmpPrjct = "count:{'$size':'$count'}";
						columns.push('count');
					}
					else if(item.viewData == 'Minimum of'){
						tmpView = "min: {$min:'$"+item.key+"'}";
						tmpPrjct = "min:1";
						columns.push('min');
					}
					else if(item.viewData == 'Maximum of'){
						tmpView = "max: {$max:'$"+item.key+"'}";
						tmpPrjct = "max:1";
						columns.push('max');
					}
				});
			}
			tmpView = JSON.stringify(tmpView);
			tmpView = tmpView.replace(/\"/g, "");

			/****For Grouping***/
			var tmpGroup = {};
			var tmpProject = {};
			var tmpGruopList = angular.copy($scope.groupbyList);
			_.forEach(tmpGruopList, function(item, key){
				if(item.key == 'recorddate' && $scope.recorddate != 'day'){
					var tmp = {};
					tmp['$'+$scope.recorddate] = '$recorddate';
					tmpGroup[item.key] = tmp;
				}
				else
					tmpGroup[item.key] = '$'+item.key;

				tmpProject[item.key] = '$_id.'+item.key;
				columns.push(item.key);
			});
			tmpGroup = JSON.stringify(tmpGroup);
			tmpGroup = tmpGroup.replace(/\"/g, "'");

			tmpProject = JSON.stringify(tmpProject);
			tmpProject = tmpProject.replace(/\"/g, "'").slice( 1, -1 );

			//$scope.selectedCollection = 'daily_devices_gtpudata';
			//var project = "'recorddate~~~day':{'$let':{'vars':{'field':'$recorddate'},'in':{'___date':{'$dateToString':{'format':'%Y-%m-%d','date':'$$field'}}}}}";
			//var aggregate_string = 'f_project:{'+ project +'}</F_TAGEND>';
			
			var aggregate_string = '';
			aggregate_string += 'f_match:'+ tmpFilter +'</F_TAGEND>';
			if( $scope.view == 'Count Of Row' || $scope.view == 'Sum Of' || $scope.view == 'Average Of' || $scope.view == 'Minimum of' || $scope.view == 'Maximum of' || $scope.view == 'Number of distinct values of'){
				//aggregate_string += "f_project:{'_id':'$_id','___group':"+tmpGroup+"}</F_TAGEND>";
				aggregate_string += "f_group:{'_id':"+tmpGroup+","+tmpView+"}</F_TAGEND>";
				aggregate_string += "f_project:{'_id':0,"+tmpProject+", "+tmpPrjct+"}</F_TAGEND>";
			}
			else if($scope.view == 'Cumulative sum of' || $scope.view == 'Cumulative count of rows' ){
				aggregate_string += "f_group:{'_id':null, "+tmpView+"}</F_TAGEND>";
				aggregate_string += "f_project:{'_id':0, "+tmpPrjct+"}</F_TAGEND>";
			}

			//Sorting
			if($scope.sortingList.length>0){
				var tmpSort = {};
				_.forEach($scope.sortingList, function(item, key){
					//columns.push(item.key);
					if(item.sorting == 'Ascending')
						tmpSort[item.key] = 1;
					else
						tmpSort[item.key] = -1;
				});

				tmpSort = JSON.stringify(tmpSort);
				tmpSort = tmpSort.replace(/\"/g, "");
				aggregate_string += "f_sort:"+tmpSort+"</F_TAGEND>";
			}

			//Limit
			if($scope.limit)
				aggregate_string += 'f_limit:'+$scope.limit+'</F_TAGEND>';

			//var columns = ["rat", "usage"];
			columns = JSON.stringify(columns).replace(/\"/g, "");
			var cuqery ="{"+"\"collection\":\""+$scope.collection.trim()+"\", \"method\":\"aggregate\", \"aggregatequery\":\"{"+aggregate_string+"}\""+",\"columns\":"+columns+"}";
			console.log(cuqery);
			$scope.cuqery = cuqery;

			//return query
			cb(cuqery);
	    }

		function submitQuery(){
			buildQuery(function(cuqery){
				searchQuery(cuqery);
			});
		}

		$scope.downloadReport = function(){
			buildQuery(function(cuqery){
				download(cuqery);
			});
		}

		function download(cuqery){
			httpService.get(globalConfig.pulldatabyRlistener + 'downloaddata&reportname='+$scope.collection+'&query='+ encodeURIComponent(cuqery)).then(function(res){
				console.log(res);
			});
		}

		$scope.loader = false;
		function searchQuery(cuqery){
			$scope.loader = true;
			$scope.recordList = [];
			httpService.get(globalConfig.pulldatabyRlistener + 'getdata&query='+ encodeURIComponent(cuqery)).then(function(response){
				$scope.loader = false;
				if(response.data == 'null' || response.data.length == 0){
					$scope.noDataFound = 'No data found';
				}else{
					$scope.display = 'table';
					// $scope.loader = false;
					var options = {
					    weekday: "long", year: "numeric", month: "short",
					    day: "numeric", hour: "2-digit", minute: "2-digit"
					};
					
					_.forEach($scope.tableList, function(item, key){
						if(item.type == 'Date'){
							$scope.recordList = _.filter(response.data, function(single){
								$scope.test = [];
								for(var key in response.data[0]){
									$scope.test.push(key);
								}
								
								if(single[item.key] != undefined){
									if( $scope.recorddate == 'week' )
										single[item.key] = 'Week ' + single[item.key];
									else if( $scope.recorddate == 'month' ){
										var month = {1: 'Jan', 2: 'Feb', 3: 'Mar', 4: 'Apr', 5: 'May', 6: 'Jun', 7: 'Jul', 8: 'Aug', 9: 'Sep', 10: 'Oct', 11: 'Nov', 12: 'Dec'};
										single[item.key] = month[single[item.key]];
									}
									else if( $scope.recorddate == undefined || $scope.recorddate != 'year'){
										var tmp = single[item.key];
										var myDate = new Date(tmp.$date);
										single[item.key] = myDate.toLocaleDateString("en-us", options);
									}
								}
								return single;
							});
					 		$scope.heading = response.data[0];
						}
					});
				}
				
			});
		}

		function savequery(query){
			$scope.loader = true;
			query.query = $scope.cuqery;
			query.collection = $scope.collection;
			query.filterList = $scope.filterList;
			query.view = $scope.view;
			query.viewList = $scope.viewList;
			query.groupbyList = $scope.groupbyList;
			query.sortingList = $scope.sortingList;
			query.limit = $scope.limit;
			if($stateParams.id){
				query.updatedDate = new Date();
				var url = dbService.makeUrl( {collection: 'customreport', op:'upsert', id: $stateParams.id} );
				httpService.post(url, query).then(function (result){
					$scope.loader = false;
					ChartService.refreshCustomReport();
					$('#saveQueryToggle').toggle();
				});
			}
			else{
				query.createDate = new Date();
				query.userId = currentUser.userId;
				var url = dbService.makeUrl( {collection: 'customreport', op:'create'} );
				httpService.post(url, query).then(function (result){
					$scope.loader = false;
					ChartService.refreshCustomReport();
					$('#saveQueryToggle').toggle();
				});
			}
		}

		function saveQueryToggle(){
			$('#saveQueryToggle').toggle();
			$('#lineOption').hide();
		}

		function changeDisplayMode(display){
			$scope.display = display;
			if(display == 'line' || display == 'bar')
				$('#lineOption').show();
			else
				$('#lineOption').hide();

			$('#saveQueryToggle').hide();
		}

		function closeDisplayPopUp(){
			$('#lineOption').hide();
			$('#saveQueryToggle').hide();
		}

		function displaylineChart(line){
			closeDisplayPopUp();
			highchartLine($scope.recordList, line);
		}

		function highchartLine(data1, line){
			var lineData = {
                labeldata: [],
                data: [{name: line.xAxis.trim(), data:[]}],
                tempData:[]
            };

	        _.forEach(data1, function(data, key){
	            var label = data[line.xAxis.trim()];
	            var keyindex = $.inArray( label, lineData.labeldata );
	            lineData.labeldata.push( label );
	            lineData.data[0].data.push(data[line.yAxis.trim()]);
	            /*if( keyindex > -1 ){
	            	lineData.data[0].data[keyindex] = data[line.yAxis];
	            }
	            else{
	                lineData.labeldata.push( label );
	                lineData.data[0].data.push(data[line.yAxis]);
	            }*/
	        });

	        var options = {
			    "options" : {
			        "title": {"text":""},
			        "credits": {"enabled": false},
			        "xAxis" :{"categories": lineData.labeldata,"title":{"text":""}},
			        "yAxis": {
			            "title": {},
			            "plotLines": [{
			                "value": 0,
			                "width": 1,
			                "color": "#808080"
			            }]
			        }
			    },
			    "series":lineData.data
			};

			if($scope.display == 'bar'){
				options.options.chart = {
		            "renderTo": "container",
		            "type":"column"
		        };
		    }
	        $scope.highChartOptions = options;
	    }

	    $scope.resetForm = function() {
		  	// $scope.reportManagement = "";
		  	$scope.collection = "";
		  	$scope.selectedItem = "";
		  	$scope.view = "";
		  	$scope.groupby = "";
			$scope.filterList = [];
			$scope.groupbyList = [];
			$scope.sortingList = [];
			$scope.viewList = [];
		}

		$scope.edit = function () {
        	$state.go('index.schedule', {'reportId': $stateParams.id });
    	}

	}