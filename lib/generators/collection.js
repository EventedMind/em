var Generator = em.Generator;
var path = require('path');
var _ = require('underscore');
var extensions = require('../extensions');

var CollectionGenerator = Generator.create({
  name: 'collection',
  aliases: ['col'],
  usage: 'em {generate, g}:{collection, col} <name> [--where]',
  description: 'Generate scaffolding for a Collection.',
  examples: [
    'em g:collection todos'
  ]
}, function (args, opts) {
  try {
    var self = this;
    var name = args[0];
    var filename = this.fileCase(name);
    var className = this.classCase(name);
    var dir = '';
    var newExt = extensions.get.call(self, '.js');

    var createCollectionFile = function (where, opts) {
      opts = opts || {};
      var relpath = path.join(where, 'collections/' + dir);
      var filepath = path.join(relpath, filename + newExt);

      var tmplOptions = {
        name: className,
        filename: filename,
        filepath: filepath,
        where: self.classCase(where)
      };

      var contentParts = [];
      contentParts.push(self.template('create_collection' + newExt, tmplOptions));
      contentParts.push(self.template('collection_query_comment' + newExt, tmplOptions));

      if (opts.withAuth) {
        contentParts.push(self.template('server/collections/collection_auth' + newExt, tmplOptions));
      }

      self.writeFile(filepath, contentParts.join('\n'));
    };

    var createCollectionAuthFile = function () {
      var relpath = path.join('server/collections/' + dir);
      var filepath = path.join(relpath, filename + newExt);
      var tmplOptions = {
        name: className,
        filename: filename,
        filepath: filepath
      };

      var contentParts = [];
      contentParts.push(self.template('collection_query_comment' + newExt, tmplOptions));
      contentParts.push(self.template('server/collections/collection_auth' + newExt, tmplOptions));
      self.writeFile(filepath, contentParts.join('\n'));
    };

    var createQueryFile = function (where) {
      opts = opts || {};
      var relpath = path.join(where, 'collections/' + dir);
      var filepath = path.join(relpath, filename + newExt);

      var tmplOptions = {
        name: className,
        filename: filename,
        filepath: filepath,
        where: self.classCase(where)
      };

      var contentParts = [];
      contentParts.push(self.template('collection_query_comment' + newExt, tmplOptions));
      self.writeFile(filepath, contentParts.join('\n'));
    };

    if (opts.where === 'client') {
      // only create a collection on the client
      createCollectionFile('client');
    } else if (opts.where === 'server') {
      // only create a collection on the server
      createCollectionFile('server', {withAuth: true});
    } else { 
      // create collection in both, with a server set of auth rules
      createCollectionFile('both');
      createCollectionAuthFile();
      createQueryFile('client');
    }
  } catch (e) {
    this.logError("Error creating collection. " + String(e));
    return 1;
  }
});
