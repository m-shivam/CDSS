var AJAX_LOADER_HTML = '<br><br><img src="../../resource/ajax-loader.gif">';
var SECONDS_PER_MINUTE = 60;

/**
 * Dynamically Load Active Orders Table
 */
function loadActiveOrders(theForm)
{
    var patientId = theForm.elements["sim_patient_id"].value;
    var simTime = theForm.elements["sim_time"].value;
    var dataPage = "ActiveOrders";
    theForm.elements["currentDataPage"].value = dataPage;

    var resultSpace = document.getElementById('currentDataTableSpace');
    resultSpace.innerHTML = AJAX_LOADER_HTML;
    ajaxRequest('dynamicdata/'+dataPage+'.py?loadActive=true&sim_patient_id='+patientId+'&sim_time='+simTime, function(data){ resultSpace.innerHTML = data; } );
}

/**
 * Dynamically Load Completed Orders Table
 */
function loadOrderHistory(theForm)
{
    var patientId = theForm.elements["sim_patient_id"].value;
    var simTime = theForm.elements["sim_time"].value;
    var dataPage = "ActiveOrders";
    var enableRecommender = theForm.enableRecommender.value;
    theForm.elements["currentDataPage"].value = dataPage;

    // Include flag to account for when recommender is not enabled
    enableRecommenderParam = ''
    console.log(enableRecommender)
    if (!enableRecommender){
      enableRecommenderParam = '&enableRecommender=False'
    }

    var resultSpace = document.getElementById('currentDataTableSpace');
    resultSpace.innerHTML = AJAX_LOADER_HTML;
    ajaxRequest('dynamicdata/'+dataPage+'.py?loadActive=false&sim_patient_id='+patientId+'&sim_time='+simTime+enableRecommenderParam, function(data){ resultSpace.innerHTML = data; } );
}

/**
 * Dynamically Load Results review Table
 */
function loadResults(theForm)
{
    var patientId = theForm.elements["sim_patient_id"].value;
    var simTime = theForm.elements["sim_time"].value;
    var dataPage = "ResultsReview";
    theForm.elements["currentDataPage"].value = dataPage;

    var resultSpace = document.getElementById('currentDataTableSpace');
    resultSpace.innerHTML = AJAX_LOADER_HTML;
    ajaxRequest('dynamicdata/'+dataPage+'.py?sim_patient_id='+patientId+'&sim_time='+simTime, function(data){ resultSpace.innerHTML = data; } );
}

/**
 * Dynamically Load Notes review Table
 */
function loadNotes(theForm)
{
    var patientId = theForm.elements["sim_patient_id"].value;
    var simTime = theForm.elements["sim_time"].value;
    var dataPage = "NotesReview";
    theForm.elements["currentDataPage"].value = dataPage;

    var resultSpace = document.getElementById('currentDataTableSpace');
    resultSpace.innerHTML = AJAX_LOADER_HTML;
    ajaxRequest('dynamicdata/'+dataPage+'.py?sim_patient_id='+patientId+'&sim_time='+simTime, function(data){ resultSpace.innerHTML = data; } );
}

/**
 * Dynamically Load a single Note's content into a view space
 */
function loadNoteContent(simNoteId)
{
    var contentField = document.forms[0].elements['noteContent.'+simNoteId];
    if ( contentField.length )
    {	// List of multiple. Just use the first item
    	 contentField = contentField[0];
    }
    var noteContent = decodeURIComponent( contentField.value );
    var resultSpace = document.getElementById('noteContentSpace');
    resultSpace.innerHTML = noteContent;
}

/**
 * Update the current simulated time by the given increment in seconds
 */
function updateTime( deltaSeconds )
{
    // Check if there are any checkboxes that are checked on the page
    boxesChecked = false
    var inputElements = document.getElementsByTagName("input");
    for (var i = 0; i < inputElements.length; i++)
        if (inputElements[i].type == "checkbox")
            if (inputElements[i].checked)
                boxesChecked = true;
    // If boxes are checked, alert user to sign orders before updating time
    if ( boxesChecked ) {
      alert("Please sign any selected orders before proceeding.");
      return;
    }

    var theForm = document.forms[0];   // Assume the first and only form
    var simTimeField = theForm.elements['sim_time'];
    var simTime = parseInt(simTimeField.value)
    simTime += deltaSeconds;
    simTimeField.value = simTime;
    theForm.submit();
}

/**
 * Selected a new clinical item / order to prepare for ordering
 */
function selectItem(checkbox)
{
    var itemInfoStr = checkbox.value;
    var infoChunks = itemInfoStr.split("|");
    var itemId = parseInt(infoChunks[0]);
    var name = infoChunks[1];
    var description = infoChunks[2];
    var theForm = document.forms[0];   // Assume the first and only form

    if ( checkbox.checked )
    {
        var newOrderSpace = document.getElementById("newOrdersDetailSpace");

		// Check if the selected order is already in the new/pending list. If so, don't add duplicates (i.e., skip it)
		var newCheckboxes = document.getElementsByClassName('newOrderCheckbox');
		var newItemExists = false;
		for( var i=0; i < newCheckboxes.length; i++ )
		{
			if ( newCheckboxes[i].value == itemId )
			{
				newItemExists = true;
				break;	// Don't need to keep looking
			}
		}

        if ( !newItemExists )
        {
			// http://stackoverflow.com/questions/494143/creating-a-new-dom-element-from-an-html-string-using-built-in-dom-methods-or-pro
			// Create a temporary div object to process an innerHTML segment.
			// Avoid doing a direct newOrderSpace.innerHTML += newHTML, because will overwrite any transient contents (i.e., checkbox deselections) in the prior content
			var div = document.createElement('div');
      // For the purpose of later analysis, get which list the original item came from and include it as a property of the new item
      var listContaining;
      if ($(checkbox).parents('#resultSpace1').length > 0) {
        listContaining = 'resultSpace1';
      } else if ($(checkbox).parents('#resultSpace2').length > 0) {
        listContaining = 'resultSpace2';
      } else {
        listContaining = 'non-recommender';
      }
      // For the purpose of later analysis, store the queryStr that resulted in item being shown and the search mode
      var queryStr = $('input[name="currentQuery"]').val();
      // Search mode defined in Track.js under lastButtonClicked

      // Get index of current result list to append as data attribute of selected boxes
      var listIdx = listIdxTracker; // Defined in Track.js

      innerHTML = div.innerHTML =  '<input type=checkbox data-list="'+listContaining+'" data-query="'+queryStr+'" data-search-mode="'+lastButtonClicked+'" data-list-idx="'+listIdx+'" name="newOrderItemId" class="newOrderCheckbox" value="'+itemId+'" checked onClick="selectNewItem('+itemId+')"><a href="javascript:clickNewItemById('+itemId+')">'+description+'</a>&nbsp;<a href="javascript:loadRelatedOrders('+itemId+')"><img src="../../resource/graphIcon.png" width=12 height=12 alt="Find Related Orders"></a><br>\n';
      // Do not show relatedOrder link when recommender not being enabled
      if ( !theForm.enableRecommender.value ) {
			     innerHTML =  '<input type=checkbox data-list="'+listContaining+'" data-query="'+queryStr+'" data-search-mode="'+lastButtonClicked+'" data-list-idx="'+listIdx+'" name="newOrderItemId" class="newOrderCheckbox" value="'+itemId+'" checked onClick="selectNewItem('+itemId+')"><a href="javascript:clickNewItemById('+itemId+')">'+description+'</a><br>\n';
      }
      div.innerHTML = innerHTML;
			newOrderSpace.appendChild(div);
		}
    }
}

/**
 * Find the order checkbox that matches the given itemId and simulate a click
 */
function clickItemById( itemId )
{
	// Find the checkbox whose value is prefixed by the given itemId
	var idPrefix = itemId+'|';
	var checkboxes = document.getElementsByClassName('orderCheckbox');
	var firstCheckbox;
	for( var i=0; i < checkboxes.length; i++ )
	{
		//console.log(checkboxes[i].value);
		if ( checkboxes[i].value.substring(0,idPrefix.length) == idPrefix )
		{
			if ( !firstCheckbox )
			{	// Simulate user clicking on checkbox to capture onClick event
				checkboxes[i].click();
				firstCheckbox = checkboxes[i];
			}
			else
			{	// If repeats found, avoid repeated actions, just set checked value for consistency
				checkboxes[i].checked = firstCheckbox.checked;
			}
		}
	}
}

/**
 * New / pending order selected, process any changes to the pending list
 */
function selectNewItem(checkbox)
{
	// Do nothing currently, though could try deleting the new / pending order row (vs. just unchecking box)
}

/**
 * Find the new order checkbox that matches the given itemId and simulate a click
 */
function clickNewItemById( itemId )
{
	// Find the checkbox whose value is prefixed by the given itemId
	var checkboxes = document.getElementsByClassName('newOrderCheckbox');
	var firstCheckbox;
	for( var i=0; i < checkboxes.length; i++ )
	{
		//console.log(checkboxes[i].value);
		if ( checkboxes[i].value == itemId )
		{
			if ( !firstCheckbox )
			{	// Simulate user clicking on checkbox to capture onClick event
				checkboxes[i].click();
				firstCheckbox = checkboxes[i];
			}
			else
			{	// If repeats found, avoid repeated actions, just set checked value for consistency
				checkboxes[i].checked = firstCheckbox.checked;
			}
		}
	}
}

/**
 * Ignore further item for any future related order searches
 */
function ignoreItem(clinicalItemId)
{
}

/**
 * Order selected to be discontinued
 */
 function cancelDiscontinueOrder(itemId)
 {
   // Do nothing currently
 }

/**
 * Select a currently active patient order for discontinuation
 */
function discontinueOrder( itemInfoStr )
{
    var infoChunks = itemInfoStr.split("|");
    var patientOrderId = parseInt(infoChunks[0]);
    var itemId = parseInt(infoChunks[1]);
    var name = infoChunks[2];
    var description = infoChunks[3];

    document.getElementById("newOrdersDetailSpace").innerHTML += '<input type=checkbox name="discontinuePatientOrderId" value="'+patientOrderId+'" checked onClick="cancelDiscontinueOrder('+patientOrderId+')"><i>Discontinue:</i> '+description+'<br>\n';
}


/**
 * Look through the entered search string to find orders
 */
function searchOrders(searchField)
{
    var searchStr = searchField.value;
    // Set hidden currentQuery input to searchStr
    $('input[name="currentQuery"]').val(searchStr)
    var maxResults = parseInt(searchField.form.maxResults.value);
    if ( searchStr.trim() == "" )
    {   // Blank string, nothing to search off of.  Use related order search instead
        loadRelatedOrders();
    }
    else
    {
    	var sortParam = '';
      var enableRecommenderParam = '';
    	if ( !searchField.form.enableRecommender.value )
    	{
    		sortParam = '&sortField=item_count desc'
        enableRecommenderParam = '&enableRecommender=False'
    	}
        var resultSpace = document.getElementById('searchResultsTableSpace');
        resultSpace.innerHTML = AJAX_LOADER_HTML;
        ajaxRequest('dynamicdata/RelatedOrders.py?resultCount='+maxResults+'&searchStr='+searchStr+sortParam+enableRecommenderParam, function(data){
          resultSpace.innerHTML = data;
          // Defined in Track.js
          recordNewResults('data')
        });
    }
}

/**
 * Search for related orders based on currently available selected items
 *
 * Expect comma-separated list of query Item IDs to search based on.
 * If none provided, will instead look for current patient record to infer current patient items/orders.
 */
function loadRelatedOrders( queryItemIdsStr )
{
    var theForm = document.forms[0];   // Assume the first and only form

    if ( !theForm.enableRecommender.value )
    {
        alert('Related orders / recommender functionality disabled');
        return;
    }

    var patientId = theForm.elements["sim_patient_id"].value;
    var simTime = theForm.elements["sim_time"].value;

    var itemQueryParams = 'sim_patient_id='+patientId+'&sim_time='+simTime; // Default to searching based on a specific patient record
    if ( queryItemIdsStr )
    {
        // Set hidden currentQuery input to queryItemId
        $('input[name="currentQuery"]').val(queryItemIdsStr);
        // Have a non-blank string of specific query Items to search by. Use if available
        itemQueryParams += '&queryItemIds='+queryItemIdsStr;
    }

    var resultSpace = document.getElementById('searchResultsTableSpace');
    resultSpace.innerHTML = '<table cellspacing=0 cellpadding=0 width=100%><tr valign=top><td id="resultSpace1" width=50% align=center></td><td id="resultSpace2" align=center></td></tr></table>'
    var resultSpace1 = document.getElementById('resultSpace1');
    var resultSpace2 = document.getElementById('resultSpace2');
    resultSpace1.innerHTML = AJAX_LOADER_HTML;
    resultSpace2.innerHTML = AJAX_LOADER_HTML;

    // Two queries for different sort options. Nest calls for sequential asynchronous call.
    // Total time takes longer to fill simultaneous queries
    var queryURL = 'dynamicdata/RelatedOrders.py?RelatedOrders=action&'+itemQueryParams+'&sortField=PPV&displayFields=&title=Common Orders';
    //console.log( queryURL );
    ajaxRequest(queryURL, function(data) {
        resultSpace1.innerHTML = data;
        // Defined in Track.js
        recordNewResults('resultSpace1') // Record any new items in resultSpace1
        queryURL = 'dynamicdata/RelatedOrders.py?RelatedOrders=action&'+itemQueryParams+'&sortField=P-YatesChi2-NegLog&filterField1=prevalence<:0.01&displayFields=&title=Related Orders'
        console.log( queryURL );
        ajaxRequest( queryURL, function(data){
          resultSpace2.innerHTML = data;
          // Defined in Track.js
          recordNewResults('resultSpace2') // Record any new items in resultSpace2
        });
    });

}

/**
 * Look through the entered search string to find order sets
 */
function searchOrderSets(searchField)
{
    var searchStr = searchField.value;
    // Set hidden currentQuery input to searchStr
    $('input[name="currentQuery"]').val(searchStr)
    var resultSpace = document.getElementById('searchResultsTableSpace');
    resultSpace.innerHTML = AJAX_LOADER_HTML;
    ajaxRequest('dynamicdata/OrderSetSearch.py?searchStr='+searchStr, function(data){
      resultSpace.innerHTML = data;
      // Defined in Track.js
      recordNewResults('data') // Record general data list
    });
}

/**
 * Look through the entered search string to find diagnoses
 */
function searchDiagnoses(searchField)
{
    var searchStr = searchField.value;
    // Set hidden currentQuery input to searchStr
    $('input[name="currentQuery"]').val(searchStr)
    var resultSpace = document.getElementById('searchResultsTableSpace');
    resultSpace.innerHTML = AJAX_LOADER_HTML;
    ajaxRequest('dynamicdata/RelatedOrders.py?sourceTables=stride_dx_list&searchStr='+searchStr, function(data){
      resultSpace.innerHTML = data;
      // Defined in Track.js
      recordNewResults('data')
    });
}

/**
 * Select and open/close an order set details
 */
function selectOrderSet(checkbox, itemLists)
{
    var externalId = parseInt(checkbox.value);
    var itemList = JSON.parse( decodeURIComponent(document.forms[0].elements['itemListJSON.'+externalId].value) );
    var itemSpace = document.getElementById('itemSpace.'+externalId);
    if ( !checkbox.checked )
    {   // Blank out items
        itemSpace.innerHTML = '';
    }
    else
    {   // Populated order set items
        var lastItemId = -1;
        var lastSectionSubgroup = '';
        var currSectionSubgroup;
        for( var i=0; i<itemList.length; i++)
        {
            currSectionSubgroup = itemList[i]['section']+' > '+itemList[i]['subgroup'];
            if ( currSectionSubgroup.toUpperCase() != lastSectionSubgroup.toUpperCase() )
            {   // New section subgroup, add a sub header
                itemSpace.innerHTML += '<br>'+currSectionSubgroup+'<br>\n'
            }
            else if ( lastItemId == itemList[i]["clinical_item_id"] )
            {   // Same as previous item. Skip these duplicates, probably from original order set offering multiple medication variants
                continue;
            }
            itemSpace.innerHTML += '<input type=checkbox onClick="selectItem(this)" value="'+itemList[i]["clinical_item_id"]+'|'+itemList[i]["name"]+'|'+itemList[i]["description"]+'">'+itemList[i]["description"]+'<br>\n';
            lastItemId = itemList[i]["clinical_item_id"];
            lastSectionSubgroup = currSectionSubgroup;
        }
    }
    // For tracking purposes, attach result bindings to orderset components and
    // record new items as a new results list
    // Both functions below are defined in Track.js
    attachResultBindings();
    recordNewResults('data');
}
