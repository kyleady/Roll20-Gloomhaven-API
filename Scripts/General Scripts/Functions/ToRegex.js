function toRegex(obj, options){
  if(typeof options != 'object') options = {};
  if(typeof obj == 'string') obj = {Name: obj};
  var pattern = '';
  if(obj.Alternates) pattern += '(?:';
  pattern += obj.Name.replace(/[-_ ]/g, '[-_\\s]*');
  if(obj.Alternates){
      pattern += '|';
    _.each(obj.Alternates, function(alternate){
      pattern += alternate.replace(/[-_ ]/g, '[-_\\s]*');
      pattern += '|';
    });
    pattern = pattern.replace(/\|$/, '');
    pattern += ')';
  }

  if(options.str) return pattern;
  return new RegExp('^\\s*' + pattern + '\\s*$', 'i');
}
