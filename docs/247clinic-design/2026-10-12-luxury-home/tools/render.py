import re,sys,json,subprocess,html
from html.parser import HTMLParser
VOID={'meta','img','br','link','input','source','path','hr','stop','circle'}
class N:
    def __init__(s,tag,attrs,parent=None): s.tag=tag; s.attrs=attrs; s.ch=[]; s.parent=parent
class B(HTMLParser):
    def __init__(s):
        super().__init__(convert_charrefs=False); s.root=N('root',[]); s.cur=s.root
    def handle_starttag(s,t,a):
        n=N(t,a,s.cur); s.cur.ch.append(n)
        if t not in VOID: s.cur=n
    def handle_startendtag(s,t,a): s.cur.ch.append(N(t,a,s.cur))
    def handle_endtag(s,t):
        if t in VOID: return
        n=s.cur
        while n and n.tag!=t: n=n.parent
        if n and n.parent: s.cur=n.parent
    def handle_data(s,d): s.cur.ch.append(d)
    def handle_entityref(s,name): s.cur.ch.append('&'+name+';')
    def handle_charref(s,name): s.cur.ch.append('&#'+name+';')
def look(path,scope):
    path=path.strip()
    if path in ('true','false'): return path=='true'
    v=scope
    for k in path.split('.'):
        if isinstance(v,dict): v=v.get(k)
        else: return None
    return v
def interp(s,scope,attr=False):
    def r(m):
        v=look(m.group(1),scope)
        if v is None or isinstance(v,(dict,list)): return ''
        return html.escape(str(v),quote=True) if attr else html.escape(str(v),quote=False)
    return re.sub(r'\{\{\s*([^}]+?)\s*\}\}',r,s)
def render(n,scope,out):
    if isinstance(n,str): out.append(interp(n,scope)); return
    if n.tag=='sc-for':
        a=dict(n.attrs); lst=look(re.sub(r'[{}]','',a['list']),scope) or []
        for i,it in enumerate(lst):
            sc=dict(scope); sc[a['as']]=it; sc['$index']=i
            for c in n.ch: render(c,sc,out)
        return
    if n.tag=='sc-if':
        a=dict(n.attrs)
        if look(re.sub(r'[{}]','',a['value']),scope):
            for c in n.ch: render(c,scope,out)
        return
    if n.tag in ('root','x-dc'):
        for c in n.ch: render(c,scope,out)
        return
    if n.tag=='helmet': return
    attrs=[]
    for k,v in n.attrs:
        if k.startswith('on'): continue
        attrs.append(f'{k}="{interp(v or "",scope,True)}"' if v is not None else k)
    svgvoid=n.tag in ('path','stop','circle')
    out.append('<'+n.tag+(' '+' '.join(attrs) if attrs else '')+('/>' if svgvoid else '>'))
    if n.tag in VOID: return
    for c in n.ch: render(c,scope,out)
    out.append('</'+n.tag+'>')
def main(src,dst,blob_base,state):
    s=open(src,encoding='utf-8').read()
    js=re.search(r'data-dc-script[^>]*>(.*?)</script>',s,re.S).group(1)
    code='class DCLogic{}\n'+js+'\nconst c=new Component();c.props={};c.state='+json.dumps(state)+';c.setState=function(){};const v=c.renderVals();console.log(JSON.stringify(v,(k,x)=>typeof x==="function"?undefined:x))'
    open(dst+'.js','w',encoding='utf-8').write(code)
    vals=json.loads(subprocess.run(['node',dst+'.js'],capture_output=True,text=True,encoding='utf-8').stdout)
    helmet=re.search(r'<helmet>(.*?)</helmet>',s,re.S).group(1)
    xdc=re.search(r'<x-dc>(.*?)</x-dc>',s,re.S).group(1)
    xdc=re.sub(r'<helmet>.*?</helmet>','',xdc,flags=re.S)
    b=B(); b.feed(xdc); out=[]; render(b.root,vals,out)
    page='<!doctype html><html><head><meta charset="utf-8">'+helmet+'<style>video{visibility:hidden}</style></head><body>'+''.join(out)+'</body></html>'
    page=page.replace('/_blob/',blob_base)
    open(dst,'w',encoding='utf-8').write(page); print('wrote',dst,len(page))
main(sys.argv[1],sys.argv[2],sys.argv[3],json.loads(sys.argv[4]) if len(sys.argv)>4 else {})
