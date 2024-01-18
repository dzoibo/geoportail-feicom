<script>
  // @ts-nocheck
  import {
    dataStore,
    rangeValue,
    buttonICSP,
    rangeValueAccord,
    storeIndicateur5,
    storeIndicateur
  } from '../../shared/store';
  import Map from '../components/Map.svelte';
  import {
    getSumOf,
    findMinMax,
    findAllObjectsByAttribute,
    uniqueValues,
    calculateTotalByRegion,
    formattedValue,
    sumISPValues,
    transformDataForBarChart,
    optionForBarChart,
    optionForLineChart,
    getSumPerYear,
    uniqueValuesInArrayOfObject,
    rechercheMulticriteres,
    rechercheMulticriteresPourFEICOM
  } from '../../shared/utilitaire';
  import {
    Drawer,
    Button,
    CloseButton,
    SidebarDropdownWrapper,
    Card,
    Listgroup,
    Tooltip,
    Chart
  } from 'flowbite-svelte';
  import {
    InfoCircleSolid,
    ArrowRightOutline,
    BadgeCheckOutline,
    DollarOutline,
    ChartOutline
  } from 'flowbite-svelte-icons';
  import { sineIn } from 'svelte/easing';
  import {
    MapLibre,
    GeolocateControl,
    NavigationControl,
    ScaleControl,
    AttributionControl,
    FullscreenControl,
    Control,
    ControlGroup,
    ControlButton,
    VectorTileSource,
    FillLayer,
    LineLayer,
    hoverStateFilter,
    JoinedData,
    GeoJSON,
    MarkerLayer,
    SymbolLayer,
    Popup
  } from 'svelte-maplibre';
  import { onMount, onDestroy } from 'svelte';

  let clickedFeature;
  let trigger = true;
  let width;
  let dataArr2 = [];
  let dataForMap = [];
  let mandatData = [];
  let icspData = [];
  let statisticsPerRegion = [];
  let MinMax = {};
  let geojsonRegionCentroid;
  let geojsonDepartementCentroid;
  let geojsonMunicipaliteCentroid;
  let unsubscribe;
  let nom_commune;
  let detailsMandatCommune = [];
  let clickedLayerInfo = null; // Variable to store information about the clicked layer
  let anneeDebutMandat = [];
  let anneeFinMandat = [];
  let showICSP;
  let currentZoom = 0;
  let showFinancement;
  let valueSliderLanding = 0; // Initialisez avec une valeur par défaut
  let valueSliderAccord = 0; // Initialisez avec une valeur par défaut
  let storeIndicateur5ForMap = {};
  let storeIndicateurForMap = {};
  let mapFilterIndicateur5 = {};
  let mapFilterIndicateur = {};
  let hidden8 = true;
  let dataForBarChart = {};
  let dataForLineChart = {};
  let optionsForChart = {};
  let optionsForChartLine = {};
  let allProject = [];
  let scale;
  const zoomMaxRegion = 0;
  const zoomMaxDep = 6;
  const zoomMaxMun = 9;
  export let options;
  let openOn = 'hover';

  let paintProperties = {
    'fill-opacity': hoverStateFilter(0.7, 0.4),
    'fill-color': [
      'case',
      ['!=', ['feature-state', 'value'], null],
      [
        'interpolate',
        ['linear'],
        ['feature-state', 'value'],
        MinMax.min,
        'rgba(222,235,247,1)',
        MinMax.max,
        'rgba(49,130,189,1)'
      ],
      'rgba(255, 255, 255, 0)'
    ]
  };
  let hiddenBackdropFalse = true;

  let transitionParamsBottom = {
    y: 320,
    duration: 200,
    easing: sineIn
  };

  let transitionParamsRight = {
    x: 320,
    duration: 200,
    easing: sineIn
  };

  // On mount
  onMount(async () => {
    const response = await fetch('./data/limite_region_centroide.geojson');
    geojsonRegionCentroid = await response.json();

    const responseDepartement = await fetch('./data/limite_departement_centroide.geojson');
    geojsonDepartementCentroid = await responseDepartement.json();

    const responseMunicipalite = await fetch('./data/limite_municipalite_centroide.geojson');
    geojsonMunicipaliteCentroid = await responseMunicipalite.json();

    unsubscribe = dataStore.subscribe((store) => {
      dataArr2 = store.dataArr;
      mandatData = store.mandatData;
      icspData = store.icspData;
    });

    // Abonnez-vous au store pour recevoir les mises à jour
    rangeValue.subscribe(($rangeValue) => {
      valueSliderLanding = $rangeValue;
    });

    // Abonnez-vous au store pour recevoir les mises à jour
    storeIndicateur5.subscribe(($storeIndicateur5) => {
      storeIndicateur5ForMap = $storeIndicateur5;
    });

    // Abonnez-vous au store pour recevoir les mises à jour
    storeIndicateur.subscribe(($storeIndicateur) => {
      storeIndicateurForMap = $storeIndicateur;
    });

    // Abonnez-vous au store pour recevoir les mises à jour
    rangeValueAccord.subscribe(($rangeValueAccord) => {
      valueSliderAccord = $rangeValueAccord;
    });

    // Abonnez-vous au store pour recevoir les mises à jour
    buttonICSP.subscribe(($showICSP) => {
      showICSP = $showICSP; // Mettez à jour la valeur locale avec la valeur du store
    });

    if (showICSP) {
      dataForMap = icspData;
    } else {
      dataForMap = dataArr2;
    }
    if (currentZoom > zoomMaxDep) {
      scale = 'id_DEPARTEMENT';
    } else {
      scale = 'id_REGION';
    }
  });

  // Reactivité
  $: {
    if (currentZoom > zoomMaxMun) {
      scale = 'id_COMMUNE';
    } else if (currentZoom < zoomMaxDep) {
      scale = 'id_REGION';
    } else {
      scale = 'id_DEPARTEMENT';
    }

    if (dataForMap.length > 0 && trigger == true) {
      if (showICSP) {
        dataForMap = icspData;
        statisticsPerRegion = calculateTotalByRegion(dataForMap, valueSliderLanding, scale);

        MinMax = findMinMax(statisticsPerRegion, 'value');
      } else {
        dataForMap = dataArr2;

        mapFilterIndicateur = rechercheMulticriteres(dataForMap, storeIndicateurForMap);
        statisticsPerRegion = getSumPerYear(mapFilterIndicateur, valueSliderAccord, scale);

        if (statisticsPerRegion.length > 0) {
          MinMax = findMinMax(statisticsPerRegion, 'value');
        } else {
          // Gérer le cas où statisticsPerRegion est vide
          MinMax = { min: 0, max: 0 }; // Vous pouvez attribuer des valeurs par défaut ou effectuer une autre action appropriée en cas d'erreur.
        }
      }

      paintProperties = getUpdatedPaintProperties(MinMax);
      let trigger = false;
      console.log(statisticsPerRegion);
    }
  }

  function handleLayerClick(e) {
    // Set the variable with information about the clicked layer
    if (!showICSP && currentZoom <= zoomMaxMun && currentZoom >= zoomMaxDep) {
      clickedLayerInfo = e;
      nom_commune = e.detail.features[0].properties['ref:COG'];
      allProject = rechercheMulticriteresPourFEICOM(
        dataForMap,
        nom_commune,
        scale,
        valueSliderAccord,
        storeIndicateurForMap
      );
    } else {
      clickedLayerInfo = e;
      nom_commune = e.detail.features[0].properties['ref:COG'];
      console.log(mandatData);
      detailsMandatCommune = findAllObjectsByAttribute(mandatData, 'id_COMMUNE', nom_commune);
      anneeDebutMandat = uniqueValuesInArrayOfObject(detailsMandatCommune, 'DEBUT MANDAT');
      anneeFinMandat = uniqueValuesInArrayOfObject(detailsMandatCommune, 'FIN MANDAT');
      console.log(detailsMandatCommune);
    }

    // Set hiddenBackdropFalse to false to show the Drawer
    hiddenBackdropFalse = false;

    hidden8 = true;
  }

  function handleLayerClickOnRegion(e) {
    if (showICSP) {
      // Set the variable with information about the clicked layer
      // Set hiddenBackdropFalse to false to show the Drawer
      // Exemple d'utilisation
      const region = e.detail.features?.[0]?.state.id_REGION;
      const label_reg = e.detail.features[0].properties.name;
      const year = valueSliderLanding;

      dataForBarChart.data = transformDataForBarChart(dataForMap, region, year);
      dataForLineChart.data = sumISPValues(dataForMap, region);

      dataForLineChart.geo = label_reg;

      dataForBarChart.year = year;
      dataForBarChart.geo = label_reg;

      // Calcul de la somme des valeurs "y"
      dataForBarChart.sum = dataForBarChart.data.reduce(
        (total, currentItem) => total + currentItem.y,
        0
      );

      hidden8 = false;
      return dataForBarChart;
    } else {
      if (!showICSP && currentZoom <= zoomMaxDep) {
        clickedLayerInfo = e;
        console.log(storeIndicateurForMap);
        nom_commune = e.detail.features[0].properties['ref:COG'];
        allProject = rechercheMulticriteresPourFEICOM(
          dataForMap,
          nom_commune,
          scale,
          valueSliderAccord,
          storeIndicateurForMap
        );
        // Set hiddenBackdropFalse to false to show the Drawer
        hiddenBackdropFalse = false;
      }
    }
  }

  function getUpdatedPaintProperties(MinMax) {
    return {
      'fill-opacity': hoverStateFilter(0.6, 0.8),
      'fill-color': [
        'case',
        ['!=', ['feature-state', 'value'], null],
        [
          'interpolate',
          ['linear'],
          ['feature-state', 'value'],
          MinMax.min,
          'rgba(222,235,247,1)',
          MinMax.max,
          'rgba(49,130,189,1)'
        ],
        'rgba(255, 255, 255, 0)'
      ]
    };
  }

  // On se désabonne pour éviter les fuites de data
  onDestroy(() => {
    unsubscribe;
  });
</script>

<svelte:window bind:innerWidth={width} />
<Drawer
  placement="right"
  transitionType="fly"
  backdrop={true}
  transitionParams={transitionParamsRight}
  bind:hidden={hiddenBackdropFalse}
  id="sidebar6"
>
  <div class="flex items-center">
    {#if currentZoom >= zoomMaxMun}
      <h5
        id="drawer-label"
        class="inline-flex items-center mb-4 text-base font-semibold text-gray-500 dark:text-gray-400"
      >
        <InfoCircleSolid class="w-4 h-4 me-2.5" />Historique municipal
      </h5>
    {:else}
      <h5
        id="drawer-label"
        class="inline-flex items-center mb-4 text-base font-semibold text-gray-500 dark:text-gray-400"
      >
        <InfoCircleSolid class="w-4 h-4 me-2.5" />Liste des projets
      </h5>
    {/if}

    <CloseButton on:click={() => (hiddenBackdropFalse = true)} class="mb-4 dark:text-white" />
  </div>

  {#if currentZoom >= zoomMaxMun}
    <h2 class="mb-6 text-center text-gray-900 text-lg dark:text-gray-400">
      {clickedLayerInfo.detail.features[0].properties.name}
    </h2>
    {#each anneeDebutMandat as mandatDeb, i}
      <div id="detailMandatForAMunicipality" class="grid grid-cols-1 gap-4 list-none">
        <SidebarDropdownWrapper label="Mandat {mandatDeb} - {anneeFinMandat[i]}">
          <svelte:fragment slot="icon">
            <BadgeCheckOutline
              class="w-5 h-5 text-gray-500 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white"
            />
          </svelte:fragment>
          {#each detailsMandatCommune as detailMandat}
            {#if detailMandat['DEBUT MANDAT'] === mandatDeb && detailMandat['FIN MANDAT'] === anneeFinMandat[i]}
              <Card padding="xl" size="md">
                <Listgroup class="border-0 dark:!bg-transparent">
                  <div class="flex items-center space-x-4 rtl:space-x-reverse">
                    <div class="flex-1 min-w-0">
                      <p class="text-sm font-medium text-gray-900 truncate dark:text-white">
                        {detailMandat.CONSEILLER || ''}
                      </p>
                      <p class="text-sm text-gray-900 truncate dark:text-white">
                        {detailMandat.ROLE || ''}
                      </p>
                      <p class="text-sm text-gray-500 truncate dark:text-gray-400">
                        {detailMandat.TELEPHONE || ''}
                      </p>
                      <p class="text-sm text-gray-500 truncate dark:text-gray-400">
                        {detailMandat.EMAIL || ''}
                      </p>
                    </div>
                    <div
                      class="inline-flex items-center text-base font-semibold text-gray-900 dark:text-white"
                    >
                      {detailMandat.PARTI || ''}
                    </div>
                  </div>
                </Listgroup>
              </Card>
            {/if}
          {/each}
        </SidebarDropdownWrapper>
      </div>
    {/each}
  {:else if !showICSP && currentZoom <= zoomMaxMun}
    <h2 class="mb-6 text-center text-gray-900 text-lg dark:text-gray-400">
      {clickedLayerInfo.detail.features[0].properties.name}
    </h2>
    <ul>
      {#each allProject as resultat}
        <Card padding="xl" size="md" class="mb-6">
          <Listgroup class="border-0 dark:!bg-transparent">
            <div class="flex items-center space-x-4 rtl:space-x-reverse">
              <div class="flex-1 min-w-0">
                {#each Object.keys(resultat) as key}
                  {#if resultat[key]}
                    <div>
                      <span class="text-sm font-medium text-gray-900 dark:text-white">
                        {key} :
                      </span>
                      <span text-sm font-normal>{resultat[key]}</span>
                    </div>
                  {/if}
                {/each}
              </div>
            </div></Listgroup
          >
        </Card>
      {/each}
    </ul>
  {/if}
</Drawer>

{#if showICSP && currentZoom < zoomMaxDep}
  <Drawer
    placement="bottom"
    class="lg:ml-[20rem] w-auto"
    transitionType="fly"
    transitionParams={transitionParamsBottom}
    bind:hidden={hidden8}
    id="sidebar8"
  >
    {#if width < 562}
      <div class="flex items-center">
        <CloseButton on:click={() => (hidden8 = true)} class="mb-4 dark:text-white" />
      </div>
    {/if}

    <div class="flex flex-auto" style="background-color:whitesmoke;">
      <div class="lg:w-1/2 sm:w-full flex sm:m-4 justify-center">
        <!-- Contenu de la première div -->
        {#await dataForBarChart then}
          {#if dataForBarChart}
            <Card class="!max-w-lg w-full">
              <!-- Utilisation de h-full pour occuper 100% de la hauteur -->
              <div
                class="w-full h-full flex justify-center items-center pb-4 mb-4 border-b border-gray-200 dark:border-gray-700"
              >
                <div class="flex items-center">
                  <div
                    class="w-12 h-12 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center me-3"
                  >
                    <DollarOutline class="w-6 h-6 text-gray-500 dark:text-gray-400" />
                  </div>
                  <div>
                    <h5 class="leading-none text-2xl font-bold text-gray-900 dark:text-white pb-1">
                      ICSP pour {dataForBarChart.geo}
                    </h5>
                    <p class="text-sm font-normal text-gray-500 dark:text-gray-400">
                      <dt class="text-gray-500 dark:text-gray-400 text-sm font-normal me-1">
                        Total ICSP en {dataForBarChart.year} :
                      </dt>
                      <dd class="text-gray-900 text-sm dark:text-white font-semibold">
                        {formattedValue(dataForBarChart.sum)}
                      </dd>
                    </p>
                  </div>
                </div>
              </div>

              {#await optionForBarChart(dataForBarChart.data) then options}
                <!-- Utilisation de h-auto pour que la hauteur s'adapte au contenu -->
                <Chart {options} />
              {/await}
            </Card>
          {/if}
        {/await}
      </div>
      <div class="lg:w-1/2 sm:w-full sm:m-4 flex justify-center">
        <!-- Contenu de la deuxième div -->
        {#await dataForLineChart then}
          {#if dataForLineChart}
            <!-- Utilisation de h-full pour occuper 100% de la hauteur -->
            <Card class="!max-w-lg w-full">
              <div
                class="w-full flex justify-center items-center pb-4 mb-4 border-b border-gray-200 dark:border-gray-700"
              >
                <div class="flex items-center">
                  <div
                    class="w-12 h-12 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center me-3"
                  >
                    <ChartOutline class="w-6 h-6 text-gray-500 dark:text-gray-400" />
                  </div>
                  <div>
                    <h5 class="leading-none text-2xl font-bold text-gray-900 dark:text-white pb-1">
                      Evolution de l'ICSP - {dataForBarChart.geo}
                    </h5>
                  </div>
                </div>
              </div>
              {#await optionForLineChart(dataForLineChart.data.label, dataForLineChart.data.data) then options}
                <!-- Utilisation de h-auto pour que la hauteur s'adapte au contenu -->
                <Chart {options} />
              {/await}
            </Card>
          {/if}
        {/await}
      </div>
    </div>
  </Drawer>
{/if}

<!-- Use the reactive dataArr to update the JoinedData component -->
{#if dataForMap.length > 0 && trigger == true}
  <MapLibre
    style="https://basemaps.cartocdn.com/gl/positron-gl-style/style.json"
    center={[12, 6]}
    zoom={5}
    attributionControl={false}
    on:zoomend={({ detail: { map } }) => (currentZoom = map.getZoom())}
    let:map
    class="w-screen"
  >
    <NavigationControl position="top-right" />
    <GeolocateControl position="top-right" fitBoundsOptions={{ maxZoom: 25 }} />
    <FullscreenControl position="top-right" />
    <ScaleControl />

    <VectorTileSource url={'pmtiles://data/regions.pmtiles'} promoteId={'ref:COG'}>
      <FillLayer
        paint={paintProperties}
        manageHoverState
        sourceLayer={'regions'}
        maxzoom={zoomMaxRegion}
        on:click={handleLayerClickOnRegion}
      />
      <LineLayer
        paint={{
          'line-opacity': 1,
          'line-width': 3,
          'line-color': 'red'
        }}
        sourceLayer={'region'}
        minzoom={zoomMaxDep}
      />
      <JoinedData data={statisticsPerRegion} idCol="id_REGION" sourceLayer="regions" />
      <!-- Contenu à afficher si showICSP est vrai -->
    </VectorTileSource>

    <GeoJSON data={geojsonRegionCentroid}>
      <JoinedData data={statisticsPerRegion} idCol="id_REGION" />
      <MarkerLayer let:feature maxzoom={6}>
        {#each statisticsPerRegion as { id_REGION, value }}
          {#if feature.properties['ref:COG'] === id_REGION}
            <div
              class="bg-gray-100 bg-opacity-50 bg-trans rounded-full p-2 shadow align flex flex-col items-center"
            >
              <div class="text-sm font-bold">{feature.properties.name}</div>
              {#if showICSP}
                <!-- Afficher la valeur avec l'unité 'XAF' -->
                <div class="text-sm font-bold">{formattedValue(value)} XAF</div>
              {:else}
                <!-- Afficher la valeur avec l'unité 'projet' -->
                <div class="text-sm font-normal">{formattedValue(value)} projets</div>
              {/if}
            </div>
          {/if}
        {/each}
      </MarkerLayer>
    </GeoJSON>

    <VectorTileSource url={'pmtiles://data/departements.pmtiles'} promoteId={'ref:COG'}>
      <FillLayer
        paint={paintProperties}
        manageHoverState
        sourceLayer={'departements'}
        minzoom={zoomMaxDep}
        maxzoom={zoomMaxMun}
        on:click={handleLayerClick}
      />
      <LineLayer
        paint={{
          'line-opacity': 1,
          'line-width': 1,
          'line-color': 'gray'
        }}
        sourceLayer={'departements'}
        minzoom={zoomMaxDep}
        maxzoom={zoomMaxMun}
      />

      <JoinedData data={statisticsPerRegion} idCol="id_DEPARTEMENT" sourceLayer="departements" />
    </VectorTileSource>

    <GeoJSON data={geojsonDepartementCentroid} promoteId="ref:COG">
      <JoinedData data={statisticsPerRegion} idCol="id_DEPARTEMENT" />
      <MarkerLayer let:feature minzoom={zoomMaxDep} maxzoom={zoomMaxMun}>
        {#each statisticsPerRegion as { id_DEPARTEMENT, value }}
          {#if feature.properties['ref:COG'] === id_DEPARTEMENT}
            <div
              class="bg-gray-100 bg-opacity-50 rounded-full p-2 shadow align flex flex-col items-center"
            >
              <div class="text-sm font-bold">{feature.properties.name}</div>
              {#if showICSP}
                <!-- Afficher la valeur avec l'unité 'XAF' -->
                <div class="text-sm font-bold">{formattedValue(value)} XAF</div>
              {:else}
                <!-- Afficher la valeur avec l'unité 'projet' -->
                <div class="text-sm font-normal">{formattedValue(value)} projets</div>
              {/if}
              <div class="text-sm font-italic"></div>
            </div>
          {/if}
        {/each}
      </MarkerLayer>
    </GeoJSON>

    <VectorTileSource url={'pmtiles://data/municipalites.pmtiles'} promoteId={'ref:COG'}>
      <JoinedData data={statisticsPerRegion} idCol="id_COMMUNE" sourceLayer="municipalites" />
      <SymbolLayer
        paint={{
          'text-color': '#333',
          'text-opacity': 1,
          'text-halo-color': '#eee',
          'text-halo-width': 0.5,
          'text-halo-blur': 0.5
        }}
        layout={{
          'text-allow-overlap': false,
          'text-field': ['get', 'name'],
          'text-halo-color': '#eee',
          'text-halo-width': 0.5,
          'text-halo-blur': 0.5,
          'text-size': 400
        }}
        minzoom={zoomMaxMun}
        sourceLayer={'municipalites'}
      />
      <FillLayer
        paint={paintProperties}
        manageHoverState
        sourceLayer={'municipalites'}
        minzoom={zoomMaxMun}
        }}
        on:click={handleLayerClick}
      />
      <LineLayer
        paint={{
          'line-opacity': 1,
          'line-color': 'gray'
        }}
        sourceLayer={'municipalites'}
        minzoom={zoomMaxMun}
      />
    </VectorTileSource>
  </MapLibre>
{/if}

<!-- 

sudo tippecanoe -o "/Users/tony/Documents/Plateforme urbaine Cameroun/data/division_admin_Ivan/departements.mbtiles" -l departements -z14 -Z0 "/Users/tony/Documents/Plateforme urbaine Cameroun/data/division_admin_Ivan/limites_departements.geojson" --force --no-line-simplification 
 
sudo tippecanoe -o "/Users/tony/Documents/Plateforme urbaine Cameroun/data/division_admin_Ivan/regions.mbtiles" -l regions -z13 -Z0 "/Users/tony/Documents/Plateforme urbaine Cameroun/data/division_admin_Ivan/limite_region.geojson" -f --no-line-simplification 
 
sudo tippecanoe -o "/Users/tony/Documents/Plateforme urbaine Cameroun/data/division_admin_Ivan/municipalites.mbtiles" -l municipalites -z14 -Z0 "/Users/tony/Documents/Plateforme urbaine Cameroun/data/division_admin_Ivan/limite_COMMUNE.geojson" -f --no-line-simplification 
 
"Plateforme urbaine Cameroun/data/pmtiles 2" convert "Plateforme urbaine Cameroun/data/regions.mbtiles"  "Plateforme urbaine Cameroun/data/region.pmtiles"                  
"Plateforme urbaine Cameroun/data/pmtiles 2" convert "Plateforme urbaine Cameroun/data/departements.mbtiles"  "Plateforme urbaine Cameroun/data/departements.pmtiles"                  
"Plateforme urbaine Cameroun/data/pmtiles 2" convert "Plateforme urbaine Cameroun/data/municipalites.mbtiles"  "Plateforme urbaine Cameroun/data/municipalites.pmtiles"                  
-->
