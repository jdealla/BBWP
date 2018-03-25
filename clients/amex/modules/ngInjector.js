// This function will create your AngularJS template and model.
import { getRootScope } from 'test_utilities'

export function InjectorTemplate(namespace, selectorForTemplateInsertion, id, html, model, whereToInsert, scope, topLevelElement) {
    let obj = {}
    // *** Required Variables ***
    // This will be used to namespace your data model which allows you to inject multiple templates
    obj.namespace = namespace;
    //  CSS selector for the element that your template will be appended to
    obj.selectorForTemplateInsertion = selectorForTemplateInsertion;
    // String. This will be the id of your template's container
    obj.id = id;
    // Prefix all expressions on your template with your namespace above (e.g.`<h1>{{${namespace}.title}}</h1>` or `<h1>{{MyNameSpaceString.title}}</h1>`).
    obj.html = html;
    // This object will be used for html interpolation on the template above
    obj.model = model;
    // *** Optional Variables ***
    // String. Where to place in relation to selection. Should be string of jQuery insertion method (e.g. 'after', 'append', 'prepend', etc.)
    obj.whereToInsert = whereToInsert;
    // Optional scope for binding. Will instantiate a new scope if not passed in.
    obj.scope = Boolean(scope) ? scope : 'new';
    
    if (typeof topLevelElement === 'string'){
        obj.topLevelElement = topLevelElement;
    }   
        return obj;
}

// No need to edit the  function below, just make sure to pass in the name of your template as the parameter.
export function inject(template) {
    let arr = Array.from(arguments);
    arr.forEach((template) => {
        let data = template;
        var $div = Boolean(data.hasOwnProperty('topLevelElement')) ? jQuery(`<${data.topLevelElement} id="${data.id}">${data.html}</${data.topLevelElement}>`): jQuery(`<div id="${data.id}">${data.html}</div>`);
        let referenceElement =  jQuery(data.selectorForTemplateInsertion);
        let insertion = (Boolean(data.whereToInsert) && typeof data.whereToInsert) === 'string' ? data.whereToInsert : 'append';
        referenceElement.length === 1 ? referenceElement[insertion]($div) : referenceElement.eq(0)[insertion]($div);
        when(function () {
            return Boolean(getRootScope());
        }).done(function () {
                jQuery('[ng-app]').data().$injector.invoke(['$compile', '$rootScope', function ($compile, $rootScope) {
                var scope = null;
                if (typeof data.scope === 'string'){
                    scope = (data.scope !== 'new' && Boolean(getRootScope().$id) ) ? jQuery(data.scope).scope() : $rootScope.$new();
                } else if (typeof data.scope === 'object') {
                    scope = data.scope;
                } else if (typeof data.scope === 'function') {
                    scope = data.scope();
                }
                scope[data.namespace] = data.model;
                $compile($div)(scope);
                scope.$apply();
            }]);
        });
    });
}