d3.text('template.erb', function (err, template) {
    if (err) {
        console.error('Error getting map info template: ', err);
        return;
    }

    template = _.template(template);

    var templateUtilities = {
        makeList: function (arr) {
            var root = d3.select(document.createElement('ul'));
            root.selectAll('li').data(arr).enter().append('li').text(_.identity);
            return root.html();
        }
    };

    d3.json('data.json', function (err, json) {
        if (err) {
            console.error('Error getting map data: ', err);
            return;
        }

        var aside = d3.select('#mapInfo');
        var paths = d3.selectAll('#map path');
        var currentZones = d3.selectAll('#currentZones');
        var mapInfoContent = d3.select('#mapInfoContent');
        var mapInfoZone = d3.select('#mapInfoZone');
        var selected = {
            id: null,
            path: null,
            data: null,
        };

        d3.select('#mapInfo .close').on('click', function () {
            aside.classed('hidden', true);
        })

        function selectMapInfoTab(zone) {
            var data = selected.data[zone] || {};
            data.zone = zone;
            data.key = selected.id;
            data.utils = templateUtilities;
            mapInfoContent.html(template(data));
            mapInfoContent.node().scrollTop = 0;
        }

        paths.on('click', function () {
            var path = d3.select(this);
            var isSelected = !path.classed('selected');
            var id = this.parentNode.id;
            var idMatch = null;

            if (!id || !(idMatch = id.match(/_x3(\d)_.(\d)/))) { return; }
            id = idMatch[1] + '-' + idMatch[2];

            path.classed('selected', isSelected);
            aside.classed('hidden', !isSelected);
            aside.classed('zone-' + id, true);
            mapInfoZone.text(id);

            if (selected.id) {
                selected.path.classed('selected', false);
                aside.classed('zone-' + selected.id, false);
            }

            selected.id = id;
            selected.path = path;
            selected.data = json[id] || {};

            if (isSelected) {
                var zones = Object.keys(selected.data);
                currentZones.html('');
                
                if (_.isEmpty(zones)) {
                    mapInfoContent.html('<p>No data available for this zone.</p>');
                    return;
                }

                var zoneTabs = currentZones.selectAll('li').data(zones).enter().append('li').classed('active', function (d,i) { return i === 0; });
                var activeTab = d3.select(zoneTabs[0][0]);
                zoneTabs
                .append('a')
                .attr('href', 'javascript:void(0)')
                .on('click', function (d, i) {
                    if (activeTab) { activeTab.classed('active', false); }
                    activeTab = d3.select(this.parentNode).classed('active',true);
                    selectMapInfoTab(d);
                })
                .text(_.identity);

                selectMapInfoTab(zones[0]);
            }
        });
    });


});


/*
      $(document).ready(function () {
        var data = ;

        var map = $('#map');
        var mapInfoFields = $('#mapInfo .map-info-field');
        var $selected = null;

        map.on('click', 'path', function (event) {
          var $target = $(event.currentTarget);
          // jQuery can't manipulate class for svg elements (!!)
          if ($target.attr('class')) {
            $selected.attr('class', '');
            $selected = null;
          } else {
            if ($selected) { $selected.attr('class',''); }
            $selected = $target;
            $selected.attr('class', 'selected');
          }
        });

        map.on('mouseenter', 'path', function (event) {
          if ($selected) { return; }
          var section = event.currentTarget.parentNode.id;
          var datum = data[section];
          if (!section || !datum) { return; }
          mapInfoFields.each(function (i, elem) {
            var $elem = $(elem);
            var d = datum[i];
            if (!Array.isArray(d)) {
              $elem.text(datum[i]);
            } else {
              $elem.html('');
              var lis = [];
              $.each(d, function (j, part) {
                var $li = $('<li>');
                $li.text(part);
                lis.push($li);
              });
              $elem.append(lis);
            }
          });
        });
      });
*/