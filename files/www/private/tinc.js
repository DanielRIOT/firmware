
function send(obj) {
    $.post("/cgi-bin/tinc", obj, function(data) {
        $('#status').text(data); 
    });
}

function create_header(title)
{
    var legend = document.createElement('legend');
    var span = document.createElement('span');
    span.innerHTML=title;
    legend.appendChild(span);
    return legend;
}

function update_host(hn)
{
    var fs = document.getElementById("host");
    removeChilds(fs);
    if(hn.length == 0) return;
    
    $.post("/cgi-bin/tinc", { func: "get_host", name : hn}, function(data) {
        if(show_error(data)) return;
        var obj = jQuery.parseJSON(data);
        
        fs.appendChild(create_header("Host: '"+hn+"'"));
        appendSettings(fs, hn, obj);
        /*
        var div = document.createElement('div');
        
        append_button(div, 'L&ouml;schen', function() {
            if(confirm("Eintrag wirklich Loeschen?"))
                send({ func : "del_host", host_name : hn });
        });
        
        append_button(div, 'Speichern', function() {
            send({ func : "set_host", host_name : hn,
                enabled : getRadioVal(hn + "_enabled"),
                net : getInputVal(hn + "_net")}
            );
        });
        
        append_button(div, 'Export', function() {
            send({ func : "export_key", host_name : hn, net_name : nn });
        });
        
        fs.appendChild(div);
        */
    });
}

function update_net(nn)
{
    var fs = document.getElementById("net");
    removeChilds(fs);
    if(nn.length == 0) return;
    
    $.post("/cgi-bin/tinc", { func: "get_net", name : nn }, function(data) {
        if(show_error(data)) return;
        var obj = jQuery.parseJSON(data);
        
        fs.appendChild(create_header("Netz: '"+nn+"'"));
        appendSettings(fs, nn, obj);
        /*
        var div = document.createElement('div');
 
        append_button(div, 'L&ouml;schen', function() {
            //var id = getParentId(this);
            if(confirm("Eintrag wirklich Loeschen?"))
                send_rebuild({ func : "del_net", net_name : nn });
        });
        
        append_button(div, 'Speichern', function() {
            send({ func : "set_net", net_name : nn,
                enabled : getRadioVal(nn + "_enabled"),
                Name : getInputVal(nn + "_Name"),
                ConnectTo : getInputVal(nn + "_ConnectTo")}
            );
        });
    
        fs.appendChild(div);
        */
    });
}

function show_host()
{
    var hn = getParentId(this);
    var nn = getParentId(this.parentNode);
    
    update_host(hn);
    update_net(nn);
}

function show_net()
{
    var nn = getParentId(this);
    update_net(nn);
    update_host("");
}

var ttable = { "enabled" : "Aktiv", "name" : "Name", "net" : "Netz", "ConnectTo", "Verbinden zu.."};
function getLabel(name)
{
    var label = ttable[name];
    return (typeof label == "undefined") ? name : label;
}

function appendSettings(parent, name, obj)
{
    for(var setting in obj)
    {
        var label = getLabel(setting);
        var value = obj[setting];
        var id = name+"_"+setting;
        if(setting == "enabled")
        {
            append_radio(parent, label, id, {"Ja":1, "Nein":0}, value);
        }
        else
        {
            append_input(parent, label, id, value);
        }
    }
}

function parse_list(data)
{
    var nets = jQuery.parseJSON(data);
    var ul = document.getElementById('data');
    removeChilds(ul);
    
    function makeList(net, ConnectTo)
    {
        var ul = document.createElement('ul');
        if(typeof ConnectTo == "undefined") return ul;
        var hosts = ConnectTo.split(" ");
        
        for(var i in hosts)
        {
            var li = document.createElement('li');
            var a = document.createElement('a');
            a.innerHTML="Host: '"+hosts[i]+"'";
            a.onclick = show_host;
            li.id=hosts[i];
            li.appendChild(a);
            ul.appendChild(li);
       }
       
       return ul;
    }
    
    for(var nn in nets)
    {
        var obj = nets[nn];
        
        var li = document.createElement('li');
        var a = document.createElement('a');
        var div = document.createElement('div');
        
        a.innerHTML="Netz: "+nn+"'";
        a.onclick = show_net;
        li.id=nn;
        
        li.appendChild(a);
        li.appendChild(makeList(nn, obj.ConnectTo));
        
        ul.appendChild(li);
    }
}

$('#export_host_key').click(function() {
    send({ func : "export_key", host_name : "", net_name : "" });
});

$('#export_net_key').click(function() {
    send({ func : "export_key", host_name : "", net_name : "" });
});

function rebuild_list() {
    $.post("/cgi-bin/tinc", { func: "get_nets" }, parse_list);
}

rebuild_list();

