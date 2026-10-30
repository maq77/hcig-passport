#!/usr/bin/env bash
# After the swap: every sitemap page 200, old addresses one hop 301 to the right page, head tags, share image, tags.
S=https://healthcareig.com; fail=0
ok() { echo "OK   $*"; } ; no() { echo "FAIL $*"; fail=1; }
# 1 every page in the sitemaps
URLS=$(for f in en de pl fr it es cs; do curl -s "$S/sitemap-$f.xml" | grep -o '<loc>[^<]*' | sed 's/<loc>//'; done | sort -u)
n=0; for u in $URLS; do c=$(curl -s -o /dev/null -w '%{http_code}' "$u"); n=$((n+1)); [ "$c" = 200 ] || no "$c $u"; done; echo "pages checked: $n"
# 2 old addresses: one hop to the expected page
while read -r from to; do
  r=$(curl -s -o /dev/null -w '%{http_code} %{redirect_url}' "$S$from"); [ "$r" = "301 $S$to" ] && ok "$from -> $to" || no "$from: $r (want $to)"
done <<'EOF'
/index.php /
/about1.php /about/
/about/index.php /about/
/group_ceo.php /about/leadership/
/services.php /services/
/servis.php /services/
/partner/index.php /partner/
/contact.php /contacts/
/kontakty.php /contacts/
/blog.php /blog/
/news1.php /blog/medpark-health-hub-opens-in-hurghada-raising-the-standard-for-healthcare-in-the/
/blog/news15.php /blog/24-7-clinics-achieve-uca-accreditation-in-chicago-a-milestone-for-global-urgent/
/de/index.php /de/
/de/partnerbereich/ /de/partner/
/?lang=de /de/
EOF
r=$(curl -s -o /dev/null -w '%{http_code} %{redirect_url}' http://www.healthcareig.com/about/); [ "${r%% *}" = 301 ] && ok "www/http -> $r" || no "www: $r"
# 3 head of the home and a German page
for p in / /de/ /network/; do h=$(curl -s "$S$p")
  echo "$h" | grep -qi noindex && no "$p noindex" || ok "$p indexable"
  echo "$h" | grep -q '<link rel="canonical" href="https://healthcareig.com' && ok "$p canonical" || no "$p canonical"
  echo "$h" | grep -q 'og-hcig.jpg' && ok "$p og image" || no "$p og image"
  echo "$h" | grep -q 'AW-17729597588' && ok "$p google tags" || no "$p google tags"
done
c=$(curl -s -o /dev/null -w '%{http_code} %{content_type}' "$S/og-hcig.jpg"); [ "${c%% *}" = 200 ] && ok "og image $c" || no "og image $c"
c=$(curl -s -o /dev/null -w '%{http_code}' "$S/api/lead.php"); [ "$c" = 405 ] && ok "lead endpoint answers (405 on GET)" || no "lead endpoint $c"
c=$(curl -s -o /dev/null -w '%{http_code}' "$S/this-page-does-not-exist/"); [ "$c" = 404 ] && ok "real 404" || no "404 page $c"
curl -s "$S/robots.txt" | grep -q 'Allow: /' && ok "robots allow" || no "robots"
[ $fail = 0 ] && echo "ALL GREEN" || echo "SOME CHECKS FAILED"
