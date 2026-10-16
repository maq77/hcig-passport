import re,glob,subprocess,json,html.parser,sys
VOID={'meta','img','br','link','input','source','path','hr','stop','circle'}
class P(html.parser.HTMLParser):
    def __init__(s): super().__init__(); s.st=[]; s.err=[]
    def handle_starttag(s,t,a):
        if t not in VOID: s.st.append((t,s.getpos()))
    def handle_startendtag(s,t,a): pass
    def handle_endtag(s,t):
        if t in VOID: return
        if not s.st: s.err.append(f'extra </{t}> {s.getpos()}'); return
        o,pos=s.st.pop()
        if o!=t: s.err.append(f'</{t}> at {s.getpos()} closes <{o}> from {pos}')
for f in sys.argv[1:]:
    src=open(f,encoding='utf-8').read(); body=src.split('<script type="text/x-dc"')[0]
    p=P(); p.feed(body)
    js=re.search(r'data-dc-script[^>]*>(.*?)</script>',src,re.S).group(1)
    open('../_t.js','w',encoding='utf-8').write('class DCLogic{}\n'+js+'\nconst c=new Component();c.props={};c.state={};c.setState=function(x){Object.assign(this.state,x)};let v=c.renderVals();const keys=Object.keys(v);for(const k of keys){if(v[k]===undefined)throw new Error("undef "+k)};for(const fn of ["openMenu","openFilm"]){if(v[fn])v[fn]()};if(v.regions)v.regions[5].pick();v=c.renderVals();console.log(JSON.stringify(keys))')
    r=subprocess.run(['node','../_t.js'],capture_output=True,text=True)
    out=(r.stdout+r.stderr).strip()
    holes=set(h.split('.')[0] for h in re.findall(r'\{\{\s*([\w.$]+)\s*\}\}',body))
    loopvars=set(re.findall(r'as="(\w+)"',body))
    try: keys=set(json.loads(out.splitlines()[-1]))
    except Exception: keys=set(); 
    print(f,'| tags:',p.err[:4] or 'ok','| open:',[t for t,_ in p.st][:4],'| js:',out[:160] if not keys else 'ok','| missing:',holes-keys-loopvars-{'true','false'} or 'none')
