build-srv:
<% if(buildCmd === 'pack'){ -%>
	pack build <% if(dockerRepositoryName !== ''){ -%><%= dockerID %>/<%= dockerRepositoryName %>:<%= projectName %>-srv<% }else{ -%><%= dockerID %>/<%= projectName %>-srv:latest<% } -%> -p srv -B paketobuildpacks/builder:base
<% }else{ -%>
	<%= buildCmd %> build --platform amd64 -t <% if(dockerRepositoryName !== ''){ -%><%= dockerID %>/<%= dockerRepositoryName %>:<%= projectName %>-srv<% }else{ -%><%= dockerID %>/<%= projectName %>-srv:latest<% } -%> -f srv/Dockerfile .
<% } -%>
build-app:
<% if(buildCmd === 'pack'){ -%>
	pack build <% if(dockerRepositoryName !== ''){ -%><%= dockerID %>/<%= dockerRepositoryName %>:<%= projectName %>-app<% }else{ -%><%= dockerID %>/<%= projectName %>-app:latest<% } -%> -p app -B paketobuildpacks/builder:base
<% }else{ -%>
	<%= buildCmd %> build --platform amd64 -t <% if(dockerRepositoryName !== ''){ -%><%= dockerID %>/<%= dockerRepositoryName %>:<%= projectName %>-app<% }else{ -%><%= dockerID %>/<%= projectName %>-app:latest<% } -%> -f app/Dockerfile .
<% } -%>

docker-push: build-srv build-app
	<% if(buildCmd === 'podman'){ -%>podman<% }else{ -%>docker<% } -%> push <% if(dockerRepositoryName !== ''){ -%><%= dockerID %>/<%= dockerRepositoryName %>:<%= projectName %>-srv<% }else{ -%><%= dockerID %>/<%= projectName %>-srv:latest<% } -%>

	<% if(buildCmd === 'podman'){ -%>podman<% }else{ -%>docker<% } -%> push <% if(dockerRepositoryName !== ''){ -%><%= dockerID %>/<%= dockerRepositoryName %>:<%= projectName %>-app<% }else{ -%><%= dockerID %>/<%= projectName %>-app:latest<% } -%>


helm-deploy:
	helm upgrade -n <%= namespace %> -i <%= projectName %>-srv helm/<%= projectName %>-srv --install<% if(kubeconfig !== ""){ -%> --kubeconfig <%= kubeconfig %><% } -%>

	helm upgrade -n <%= namespace %> -i <%= projectName %>-app helm/<%= projectName %>-app --install<% if(kubeconfig !== ""){ -%> --kubeconfig <%= kubeconfig %><% } -%>


helm-undeploy:
	helm uninstall -n <%= namespace %> <%= projectName %>-app<% if(kubeconfig !== ""){ -%> --kubeconfig <%= kubeconfig %><% } -%>

	helm uninstall -n <%= namespace %> <%= projectName %>-srv<% if(kubeconfig !== ""){ -%> --kubeconfig <%= kubeconfig %><% } -%>