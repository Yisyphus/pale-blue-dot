# bump every ?v= in index.html, stamp the version, regenerate files.json
import json,hashlib,datetime,re,os
os.chdir(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..'))
h=lambda f: hashlib.sha256(open(f,'rb').read()).hexdigest()[:16]
j=json.load(open('files.json'))
ver=datetime.datetime.now(datetime.UTC).strftime('%Y-%m-%dT%H:%M:%SZ')
ix=open('index.html').read()
ix=re.sub(r'(src|href)="([\w.-]+\.(?:js|css|png))\?v=[a-f0-9]+"', lambda m: f'{m.group(1)}="{m.group(2)}?v={h(m.group(2))}"', ix)
ix=re.sub(r'<meta name="pbd-version" content="[^"]*">', f'<meta name="pbd-version" content="{ver}">', ix)
open('index.html','w').write(ix)
for f in j['files']: j['files'][f]=h(f)
j['server']=h('server.js'); j['version']=ver
json.dump(j,open('files.json','w'),indent=1); open('files.json','a').write('\n')
print(ver)
