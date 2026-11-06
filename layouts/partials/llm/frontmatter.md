{{- /* YAML front matter with the page's key facts. Values are JSON-encoded, which is valid YAML. */ -}}
{{- $p := . -}}
{{- $fm := slice -}}
{{- $fm = $fm | append (printf "title: %s" (jsonify (dict "noHTMLEscape" true) $p.Title)) -}}
{{- with $p.Description -}}{{- $fm = $fm | append (printf "description: %s" (jsonify (dict "noHTMLEscape" true) .)) -}}{{- end -}}
{{- $fm = $fm | append (printf "url: %s" (jsonify (dict "noHTMLEscape" true) $p.Permalink)) -}}
{{- $fm = $fm | append (printf "language: %s" (jsonify (dict "noHTMLEscape" true) $p.Language.Locale)) -}}
{{- if not $p.Date.IsZero -}}{{- $fm = $fm | append (printf "date: %s" ($p.Date.Format "2006-01-02")) -}}{{- end -}}
{{- if not $p.Lastmod.IsZero -}}{{- $fm = $fm | append (printf "lastmod: %s" ($p.Lastmod.Format "2006-01-02")) -}}{{- end -}}
{{- with $p.Params.authors -}}
  {{- $names := slice -}}
  {{- range . -}}
    {{- with site.GetPage (printf "/authors/%s" .) -}}{{- $names = $names | append .Title -}}{{- else -}}{{- $names = $names | append . -}}{{- end -}}
  {{- end -}}
  {{- $fm = $fm | append (printf "authors: %s" (jsonify (dict "noHTMLEscape" true) $names)) -}}
{{- end -}}
{{- with $p.Params.categories -}}{{- $fm = $fm | append (printf "categories: %s" (jsonify (dict "noHTMLEscape" true) .)) -}}{{- end -}}
{{- with $p.Params.client -}}{{- $fm = $fm | append (printf "client: %s" (jsonify (dict "noHTMLEscape" true) .)) -}}{{- end -}}
{{- with $p.Params.techStack -}}{{- $fm = $fm | append (printf "tech_stack: %s" (jsonify (dict "noHTMLEscape" true) (apply (split . ",") "strings.TrimSpace" "."))) -}}{{- end -}}
{{- with $p.Params.link -}}{{- $fm = $fm | append (printf "client_website: %s" (jsonify (dict "noHTMLEscape" true) .)) -}}{{- end -}}
{{- with $p.Params.company -}}{{- $fm = $fm | append (printf "company: %s" (jsonify (dict "noHTMLEscape" true) .)) -}}{{- end -}}
{{- with $p.Params.designation -}}{{- $fm = $fm | append (printf "role: %s" (jsonify (dict "noHTMLEscape" true) .)) -}}{{- end -}}
{{- with $p.Params.linkedin -}}{{- $fm = $fm | append (printf "linkedin: %s" (jsonify (dict "noHTMLEscape" true) .)) -}}{{- end -}}
{{- $fm = $fm | append (printf "publisher: %s" (jsonify (dict "noHTMLEscape" true) "tim&koko (Tim&Koko AG)")) -}}
---
{{ delimit $fm "\n" }}
---
