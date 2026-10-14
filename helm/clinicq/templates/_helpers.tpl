{{/*
ClinicQ helper templates - shared naming and labels.
*/}}
{{- define "clinicq.fullname" -}}
{{- printf "%s-%s" .Release.Name "clinicq" | trunc 63 | trimSuffix "-" -}}
{{- end -}}

{{- define "clinicq.labels" -}}
app.kubernetes.io/name: clinicq
app.kubernetes.io/instance: {{ .Release.Name }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
{{- end -}}
