Polymer({
  "is": "oskari-grid",
  "properties": {
    "rows": {
      "type": Array,
      "notify": true
    },
    "headers": {
      "type": Array,
      "notify": true
    },
    "numcols": {
      "type": Number,
      "notify": true
    },
    "statsrows": {
      "type": Array,
      "notify": true
    },
    "allSelected": {
      "type": Boolean,
      "notify": true,
      "value": true
    },
    "selectedIndicators": {
      "type": Array,
      "notify": true
    },
    "ajaxUrl": {
      "type": String,
      "notify": true
    },
    "filtering": Boolean,
    "sorting": Boolean,
    "deleting": Boolean
  },
  "observers": [
                "headersChanged(headers)",
                "rowsChanged(rows)"
                ],
                "toggleStats": function() {
                  this.$.statscollapse.toggle();
                  this.resize();
                },
                "allSelectedChanged": function() {
                  var me = this;
                  if (me.rows) {
                    if (me.allSelected) {
                      me.rows.forEach(function (row, index) {
                        me.set("rows." + index + ".selected", true);
                      });
                    } else {
                      me.rows.forEach(function (row, index) {
                        me.set("rows." + index + ".selected", false);
                      });
                    }
                  }
                },
                "selectionsChanged": function() {
                  var me = this;
                  me.allSelected = true;
                  me.rows.forEach(function (row, index) {
                    if (!row.selected) {
                      me.allSelected = false;
                    }
                  });
                  // For updating the checkbox states.
                  me.rows.forEach(function (row, index) {
                    me.set("rows." + index + ".selected", row.selected);
                  });
                  this.$.rowsTemplate.render();
                  this.fire("onSelectionsChanged", {});
                  setTimeout(this.resize.bind(this), 100);
                },
                "headersChanged": function() {
                  this.numcols = this.headers.length + 1;
                  setTimeout(this.resize.bind(this), 100);
                },
                "rowsChanged": function() {
                  this.numcols = this.headers.length + 1;
                  setTimeout(this.resize.bind(this), 100);
                },
                /**
                 * This is just used for sorting and filtering.
                 */
                "refresh": function() {
                  this.$.headersTemplate.render();
                  this.$.rowsTemplate.render();
                  this.resize();
                },
                "onSort": function(event) {
                  if (this.sorting) {
                    this.fire("onSort", {index: event.target.index, header: event.target.header});
                  }
                },
                "onDelete": function(event) {
                  if (this.deleting) {
                    this.fire("onDelete", {index: event.target.index, header: event.target.header});
                  }
                },
                "onFilter": function(event) {
                  if (this.filtering) {
                    this.fire("onFilter", {index: event.target.index, header: event.target.header});
                  }
                },
                "resize": function() {
                  // There is no clean and elegant way of making HTML5 table header float with x and y scrollbars.
                  // The cleanest de facto solution is to define the table display as "block", breaking the standard
                  // table layout, which makes sure that the table cells resize based on horizontal and vertical content
                  // in neighboring cells.
                  var statsHeight = jQuery('#statisticsContainer').height();
                  if (this.$.statscollapse.opened) {
                    // We have to add this height manually, because it takes time for the statisticsContainer to expand.
                    var margin = 20;
                    statsHeight += jQuery('#oskari-grid-statistics').height() + margin;
                  }
                  var indicatorSelectorHeight = jQuery('#indicatorSelectorDiv').height();
                  var headerHeight = jQuery('#oskari-grid-header').height();
                  var regionSelectorHeight = jQuery('#region-category-selector').height();
                  var totalHeight = jQuery('.statsgrid_100').height() - 10;
                  var bodyWidth = jQuery('.statsgrid_100').width() - 10;

                  var gridHeight = totalHeight - indicatorSelectorHeight - regionSelectorHeight;
                  var bodyHeight = gridHeight - statsHeight - headerHeight - 20;
                  jQuery('#oskariGrid').height(gridHeight);
                  jQuery('#oskari-grid-body').height(bodyHeight);
                  var colWidthNum = 120;
                  var checkboxColWidthNum = 40;
                  var colWidth = colWidthNum + 'px';
                  var checkboxColWidth = checkboxColWidthNum + 'px';
                  var gridWidthNum = 0;
                  var lastColIndex = this.headers.length;
                  ['checkbox'].concat(this.headers).forEach(function(header, headerIndex) {
                    // The indexing starts at 1, and the first header column is actually nth-child(3) because of the template.
                    var thisColWidthNum = colWidthNum;
                    if (headerIndex == 0) {
                      thisColWidthNum = checkboxColWidthNum;
                    }
                    var thisColWidth = thisColWidthNum + 'px';
                    gridWidthNum += thisColWidthNum;
                    var index = (headerIndex == 0)?(headerIndex + 1):(headerIndex + 2);

                    jQuery('thead#oskari-grid-header th:nth-child(' + index + ')').css('max-width', thisColWidth);
                    jQuery('thead#oskari-grid-header th:nth-child(' + index + ')').css('min-width', thisColWidth);
                    jQuery('thead#oskari-grid-header th:nth-child(' + index + ')').css('width', thisColWidth);
                    if (headerIndex == lastColIndex) {
                      // We will only set a bit of flex for the last column to make space for the scrollbar.
                      var lastColMinWidth = (thisColWidthNum - 20) + 'px';
                      var lastColStdWidth = (thisColWidthNum - 15) + 'px';
                      jQuery('tbody#oskari-grid-body td:nth-child(' + index + ')').css('max-width', thisColWidth);
                      jQuery('tbody#oskari-grid-body td:nth-child(' + index + ')').css('min-width', lastColMinWidth);
                      jQuery('tbody#oskari-grid-body td:nth-child(' + index + ')').css('width', lastColStdWidth);
                    } else {
                      jQuery('tbody#oskari-grid-body td:nth-child(' + index + ')').css('max-width', thisColWidth);
                      jQuery('tbody#oskari-grid-body td:nth-child(' + index + ')').css('min-width', thisColWidth);
                      jQuery('tbody#oskari-grid-body td:nth-child(' + index + ')').css('width', thisColWidth);
                    }
                  });
                  var gridWidth = gridWidthNum + "px";
                  jQuery('#statisticsContainer').css('max-width', gridWidth);
                  jQuery('#statisticsContainer').css('min-width', gridWidth);
                  jQuery('#statisticsContainer').css('width', gridWidth);
                  jQuery('.oskari-grid-width').css('max-width', gridWidth);
                  jQuery('.oskari-grid-width').css('min-width', gridWidth);
                  jQuery('.oskari-grid-width').css('width', gridWidth);
                  this.headers.forEach(function(header, headerIndex) {
                    // The indexing starts at 1.
                    var index = headerIndex + 1;
                    var statsColWidth = colWidth;
                    // The first column should span the checkbox and the municipality columns.
                    if (headerIndex == 0) {
                      var paddingAndBorder = 1;
                      statsColWidth = (colWidthNum + checkboxColWidthNum + paddingAndBorder) + 'px';
                    }
                    jQuery('#oskari-grid-statistics td:nth-child(' + index + ')').css('max-width', statsColWidth);
                    jQuery('#oskari-grid-statistics td:nth-child(' + index + ')').css('min-width', statsColWidth);
                    jQuery('#oskari-grid-statistics td:nth-child(' + index + ')').css('width', statsColWidth);
                  });
                },
                "ready": function() {
                },
                "attached": function() {
                  var me = this;
                  this.resize();
                  $(window).bind('resize', function(e) {
                    me.resize();
                  });
                  $(window).bind('resize', function(e) {
                    me.resize();
                  });
                }
});
