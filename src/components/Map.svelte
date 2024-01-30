<script>
  // @ts-nocheck
  import {
    dataStore,
    rangeValue,
    buttonICSP,
    rangeValueAccord,
    storeIndicateur5,
    storeIndicateur,
    heightNavBar
  } from '../../shared/store';
  import Pagination from '../components/Pagination.svelte';
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
    Chart,
    Tabs,
    TabItem,
    Table,
    TableBody,
    TableBodyCell,
    TableBodyRow,
    TableHead,
    TableHeadCell
  } from 'flowbite-svelte';
  import {
    InfoCircleSolid,
    ArrowRightOutline,
    BadgeCheckOutline,
    DollarOutline,
    ChartOutline,
    LandmarkOutline,
    GridSolid
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
  let valueSliderICSP = 0; // Initialisez avec une valeur par défaut
  let valueSliderAccord = []; // Initialisez avec une valeur par défaut
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
  const zoomMaxRegion = 6;
  const zoomMaxDep = 6;
  const zoomMaxMun = 6;
  let heightNavBarForSideBar;
  let sidebarId;
  let showDep = false;
  let showCom = false;
  let showReg = true;
  let currentGeo = 'reg';
  let resultat;
  let heightSideBar;
  // bbox du Cameroun
  let bbox = [
    [-6.81, -6.492371],
    [31.841812, 18.227069]
  ];

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
      valueSliderICSP = $rangeValue;
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
    heightNavBar.subscribe(($heightNavBar) => {
      heightNavBarForSideBar = $heightNavBar;
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

  // Sélectionnez l'élément du drawer par son identifiant
  sidebarId = document.getElementById('sidebar6');

  // Reactivité
  $: {
    if (showCom) {
      scale = 'id_COMMUNE';
    } else if (showReg) {
      scale = 'id_REGION';
    } else {
      scale = 'id_DEPARTEMENT';
    }
    if (sidebarId) {
      heightSideBar = sidebarId.offsetHeight;
    }

    if (dataForMap.length > 0 && trigger == true) {
      if (showICSP) {
        console.log(valueSliderICSP);
        dataForMap = icspData;
        statisticsPerRegion = calculateTotalByRegion(
          dataForMap,
          valueSliderICSP[0],
          valueSliderICSP[1],
          scale,
          storeIndicateurForMap.icsp
        );

        console.log(statisticsPerRegion);

        MinMax = findMinMax(statisticsPerRegion, 'value');
      } else {
        dataForMap = dataArr2;

        mapFilterIndicateur = rechercheMulticriteres(dataForMap, storeIndicateurForMap.accord);
        statisticsPerRegion = getSumPerYear(
          mapFilterIndicateur,
          valueSliderAccord[0],
          valueSliderAccord[1],
          scale
        );

        if (statisticsPerRegion.length > 0) {
          MinMax = findMinMax(statisticsPerRegion, 'value');
        } else {
          // Gérer le cas où statisticsPerRegion est vide
          MinMax = { min: 0, max: 0 }; // Vous pouvez attribuer des valeurs par défaut ou effectuer une autre action appropriée en cas d'erreur.
        }
      }

      paintProperties = getUpdatedPaintProperties(MinMax);
      let trigger = false;
    }
  }

  function handleLayerClick(e) {
    // Set the variable with information about the clicked layer
    clickedLayerInfo = e;

    if (showCom) {
      nom_commune = e.detail.features[0].properties['ref:COG'];
      detailsMandatCommune = findAllObjectsByAttribute(mandatData, 'id_COMMUNE', nom_commune);
      anneeDebutMandat = uniqueValuesInArrayOfObject(detailsMandatCommune, 'DEBUT MANDAT');
      anneeFinMandat = uniqueValuesInArrayOfObject(detailsMandatCommune, 'FIN MANDAT');
      console.log(detailsMandatCommune);
    }
    if (!showICSP) {
      nom_commune = e.detail.features[0].properties['ref:COG'];
      allProject = rechercheMulticriteresPourFEICOM(
        dataForMap,
        nom_commune,
        scale,
        valueSliderAccord[0],
        valueSliderAccord[1],
        storeIndicateurForMap.accord
      );
      hiddenBackdropFalse = false;
    } else {
      // Set the variable with information about the clicked layer
      // Set hiddenBackdropFalse to false to show the Drawer
      // Exemple d'utilisation
      const region = e.detail.features[0].properties['ref:COG'];
      const label_reg = e.detail.features[0].properties.name;

      dataForBarChart.data = transformDataForBarChart(
        dataForMap,
        region,
        valueSliderICSP[0],
        valueSliderICSP[1],
        'id_COMMUNE'
      );
      dataForLineChart.data = sumISPValues(dataForMap, region, 'id_COMMUNE');

      dataForLineChart.geo = label_reg;

      dataForBarChart.year = valueSliderICSP[0] + ' / ' + valueSliderICSP[1];
      dataForBarChart.geo = label_reg;

      // Calcul de la somme des valeurs "y"
      dataForBarChart.sum = dataForBarChart.data.reduce(
        (total, currentItem) => total + currentItem.y,
        0
      );
      hiddenBackdropFalse = false;
      return dataForBarChart;
    }

    // Set hiddenBackdropFalse to false to show the Drawer
  }

  function handleLayerClickOnRegion(e) {
    if (showICSP) {
      // Set the variable with information about the clicked layer
      // Set hiddenBackdropFalse to false to show the Drawer
      // Exemple d'utilisation
      const region = e.detail.features?.[0]?.state.id_REGION;
      const label_reg = e.detail.features[0].properties.name;

      dataForBarChart.data = transformDataForBarChart(
        dataForMap,
        region,
        valueSliderICSP[0],
        valueSliderICSP[1],
        'id_REGION'
      );
      dataForLineChart.data = sumISPValues(dataForMap, region, 'id_REGION');

      dataForLineChart.geo = label_reg;

      dataForBarChart.year = valueSliderICSP[0] + ' / ' + valueSliderICSP[1];
      dataForBarChart.geo = label_reg;

      // Calcul de la somme des valeurs "y"
      dataForBarChart.sum = dataForBarChart.data.reduce(
        (total, currentItem) => total + currentItem.y,
        0
      );

      hiddenBackdropFalse = false;
      return dataForBarChart;
    } else {
      if (!showICSP && showReg) {
        clickedLayerInfo = e;

        nom_commune = e.detail.features[0].properties['ref:COG'];
        allProject = rechercheMulticriteresPourFEICOM(
          dataForMap,
          nom_commune,
          scale,
          valueSliderAccord[0],
          valueSliderAccord[1],
          storeIndicateurForMap.accord
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

  function toggleLayer(layer) {
    showReg = layer === 'reg' ? true : false;
    showDep = layer === 'dep' ? true : false;
    showCom = layer === 'com' ? true : false;

    // Supprimez la classe "active" de tous les boutons
    const buttons = document.querySelectorAll('.maplibregl-ctrl-icon');
    buttons.forEach((button) => {
      button.classList.remove('active');
    });

    // Ajoutez la classe "active" uniquement au bouton cliqué
    const button = document.querySelector(`#${layer}`);
    if (button) {
      button.classList.add('active');
    }
  }

  // On se désabonne pour éviter les fuites de data
  onDestroy(() => {
    unsubscribe;
  });
</script>

<svelte:window bind:innerWidth={width} />
<Drawer
  placement="right"
  style="top:{heightNavBarForSideBar}px"
  class="lg:w-1/3 md:w-1/3 sm:w-1/2 w-2/3 w-auto !p-0"
  transitionType="fly"
  backdrop={true}
  transitionParams={transitionParamsRight}
  bind:hidden={hiddenBackdropFalse}
  id="sidebar6"
>
  <div class="bg-[#00862b14] div-wrapper" style="height:{heightSideBar}px !important">
    <Tabs style="full" class="space-x-0 w-full flex !flex-nowrap bg-white">
      {#if showCom}
        <Tooltip triggeredBy="#historique" type="auto"
          >Historique des exécutifs communaux qui se sont succédés
        </Tooltip>
        <TabItem>
          <div slot="title" class="flex items-center gap-1">
            <LandmarkOutline size="sm" />
            Historique municipal
            <h5
              id="historique"
              class="inline-flex items-center mb-4 text-sm font-light text-gray-400 dark:text-gray-200"
            >
              <InfoCircleSolid class="w-4 h-4 me-2.5" />
            </h5>
          </div>

          <h2 class="mb-6 text-center text-black-900 text-xl poppins-medium">
            {clickedLayerInfo.detail.features[0].properties.name}
          </h2>
          {#each anneeDebutMandat as mandatDeb, i}
            <div id="detailMandatForAMunicipality" class="gap-4 p-4 list-none">
              <SidebarDropdownWrapper label="Mandat {mandatDeb} - {anneeFinMandat[i]}">
                <svelte:fragment slot="icon">
                  <BadgeCheckOutline
                    class="w-5 h-5 text-gray-500 transition duration-75 dark:text-gray-400 hover:text-blue-900 dark:group-hover:text-white"
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
        </TabItem>
      {/if}
      {#if !showICSP}
        <Tooltip triggeredBy="#projets" type="auto">Liste de l'ensemble des projets filtrés</Tooltip
        >
        <TabItem open class="" id="projets">
          <div slot="title" class="flex items-center gap-1">
            <GridSolid size="sm" />
            Liste des projets
            <h5
              id="projets"
              class="inline-flex items-center mb-4 text-sm font-light text-gray-400 dark:text-gray-200"
            >
              <InfoCircleSolid class="w-4 h-4 me-2.5" />
            </h5>
          </div>

          <h2 class="mb-6 text-center text-black-900 text-xl poppins-medium">
            {clickedLayerInfo.detail.features[0].properties.name} <br />
            <span class="text-gray-500 dark:text-gray-400 text-sm font-normal me-1">
              Nombre de projets : {allProject.length}</span
            >
          </h2>
          <ul class="p-4 w-full justify-center">
            <Table shadow hoverable={true} striped={true}>
              <TableHead>
                <TableHeadCell></TableHeadCell>
                {#each Object.keys(allProject[0]) as key}
                  <TableHeadCell>{key}</TableHeadCell>
                {/each}
              </TableHead>
              <TableBody class="divide-y">
                {#each allProject as project}
                  <TableBodyRow>
                    <TableBodyCell></TableBodyCell>
                    {#each Object.keys(project) as key}
                      <TableBodyCell>{project[key]}</TableBodyCell>
                    {/each}
                  </TableBodyRow>
                {/each}
              </TableBody>
            </Table>
          </ul>
        </TabItem>
      {:else}
        <TabItem open class="hover:text-blue-900">
          <Tooltip triggeredBy="#stat" type="auto">
            Statistique des ICSP dans le temps pour un territoire choisi
          </Tooltip>
          <div slot="title" class="flex items-center gap-1">
            <GridSolid size="sm" />
            Stats ICSP
            <h5
              id="stat"
              class="inline-flex items-center mb-4 text-sm font-light text-gray-400 dark:text-gray-200"
            >
              <InfoCircleSolid class="w-4 h-4 me-2.5" />
            </h5>
          </div>

          <div class="p-4 lg:w-full sm:w-full flex justify-center">
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
                        <h5
                          class="leading-none text-2xl font-bold text-gray-900 dark:text-white pb-1 poppins-medium"
                        >
                          ICSP pour le territoire : {dataForBarChart.geo}
                        </h5>
                        <p class="text-sm font-normal text-gray-500 dark:text-gray-400">
                          <dt class="text-gray-500 dark:text-gray-400 text-sm font-normal me-1">
                            Total ICSP pour la période {dataForBarChart.year} :
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
          <div class="p-4 lg:w-full sm:w-full flex justify-center mb-4">
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
                        <h5
                          class="leading-none text-2xl font-bold text-gray-900 dark:text-white pb-1 poppins-medium"
                        >
                          Evolution de l'ICSP <br />
                          <p class="text-sm font-normal text-gray-500 dark:text-gray-400">
                            <dt class="text-gray-500 dark:text-gray-400 text-sm font-normal me-1">
                              Territoire : {dataForBarChart.geo}
                            </dt>
                          </p>
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
          </div></TabItem
        >
      {/if}
    </Tabs>
  </div>
</Drawer>

<!-- Use the reactive dataArr to update the JoinedData component -->
{#if dataForMap.length > 0 && trigger == true}
  <MapLibre
    style="https://basemaps.cartocdn.com/gl/positron-gl-style/style.json"
    center={[12, 6]}
    zoom={5}
    maxBounds={bbox}
    attributionControl={false}
    on:zoomend={({ detail: { map } }) => (currentZoom = map.getZoom())}
    let:map
    class="w-screen"
  >
    <NavigationControl position="top-right" />
    <GeolocateControl position="top-right" fitBoundsOptions={{ maxZoom: 25 }} />
    <FullscreenControl position="top-right" />
    <ScaleControl />

    <Control position="top-left" class="flex flex-col gap-y-2">
      <ControlGroup>
        <ControlButton id="reg" on:click={() => toggleLayer('reg')}>REG</ControlButton>
        <ControlButton id="dep" on:click={() => toggleLayer('dep')}>DEP</ControlButton>
        <ControlButton id="com" on:click={() => toggleLayer('com')}>COM</ControlButton>
      </ControlGroup>
    </Control>

    <GeoJSON data={'/data/countries.geojson'}>
      <FillLayer paint={{ 'fill-color': 'black', 'fill-opacity': 0.6 }} />
    </GeoJSON>

    <VectorTileSource url={'pmtiles://data/regions.pmtiles'} promoteId={'ref:COG'}>
      {#if showReg}
        <FillLayer
          paint={paintProperties}
          manageHoverState
          hoverCursor="pointer"
          sourceLayer={'regions'}
          on:click={handleLayerClickOnRegion}
        />
        <LineLayer
          paint={{
            'line-opacity': 1,
            'line-width': 3,
            'line-color': 'red'
          }}
          sourceLayer={'region'}
        />
        <JoinedData data={statisticsPerRegion} idCol="id_REGION" sourceLayer="regions" />
        <!-- Contenu à afficher si showICSP est vrai -->
      {/if}
    </VectorTileSource>

    <GeoJSON data={geojsonRegionCentroid}>
      {#if showReg}
        <JoinedData data={statisticsPerRegion} idCol="id_REGION" />
        <MarkerLayer let:feature>
          {#each statisticsPerRegion as { id_REGION, value }}
            {#if feature.properties['ref:COG'] === id_REGION}
              <div
                class="bg-gray-100 bg-opacity-50 bg-trans rounded-full p-2 shadow align flex flex-col items-center"
              >
                <div class="text-sm poppins-medium">{feature.properties.name}</div>
                {#if showICSP}
                  <!-- Afficher la valeur avec l'unité 'XAF' -->
                  <div class="text-sm poppins-light">{formattedValue(value)} XAF</div>
                {:else}
                  <!-- Afficher la valeur avec l'unité 'projet' -->
                  <div class="text-sm poppins-light">{formattedValue(value)} projets</div>
                {/if}
              </div>
            {/if}
          {/each}
        </MarkerLayer>
      {/if}
    </GeoJSON>

    <VectorTileSource url={'pmtiles://data/departements.pmtiles'} promoteId={'ref:COG'}>
      <JoinedData data={statisticsPerRegion} idCol="id_DEPARTEMENT" sourceLayer="departements" />
      {#if showDep}
        <FillLayer
          hoverCursor="pointer"
          paint={paintProperties}
          manageHoverState
          sourceLayer={'departements'}
          on:click={handleLayerClick}
        />
        <LineLayer
          paint={{
            'line-opacity': 1,
            'line-width': 1,
            'line-color': 'gray'
          }}
          sourceLayer={'departements'}
        />
      {/if}
    </VectorTileSource>

    {#if showDep}
      <GeoJSON data={geojsonDepartementCentroid} promoteId="ref:COG">
        <JoinedData data={statisticsPerRegion} idCol="id_DEPARTEMENT" />
        <MarkerLayer let:feature>
          {#each statisticsPerRegion as { id_DEPARTEMENT, value }}
            {#if feature.properties['ref:COG'] === id_DEPARTEMENT}
              <div
                class="bg-gray-100 bg-opacity-50 rounded-full p-2 shadow align flex flex-col items-center"
              >
                <div class="text-sm poppins-medium">{feature.properties.name}</div>
                {#if showICSP}
                  <!-- Afficher la valeur avec l'unité 'XAF' -->
                  <div class="text-sm poppins-light">{formattedValue(value)} XAF</div>
                {:else}
                  <!-- Afficher la valeur avec l'unité 'projet' -->
                  <div class="text-sm poppins-light">{formattedValue(value)} projets</div>
                {/if}
                <div class="text-sm font-italic"></div>
              </div>
            {/if}
          {/each}
        </MarkerLayer>
      </GeoJSON>
    {/if}
    <VectorTileSource url={'pmtiles://data/municipalites.pmtiles'} promoteId={'ref:COG'}>
      <JoinedData data={statisticsPerRegion} idCol="id_COMMUNE" sourceLayer="municipalites" />
      {#if showCom}
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
          sourceLayer={'municipalites'}
        />
        <FillLayer
          paint={paintProperties}
          manageHoverState
          hoverCursor="pointer"
          sourceLayer={'municipalites'}
          }}
          on:click={handleLayerClick}
        ></FillLayer>

        <LineLayer
          paint={{
            'line-opacity': 1,
            'line-color': 'gray'
          }}
          sourceLayer={'municipalites'}
        />
      {/if}
    </VectorTileSource>

    {#if showCom}
      <GeoJSON data={geojsonMunicipaliteCentroid} promoteId="ref:COG">
        <JoinedData data={statisticsPerRegion} idCol="id_COMMUNE" />
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
            'text-size': {
              stops: [
                [3, 3], // À un niveau de zoom de 3, la taille du texte est de 16
                [20, 54] // À un niveau de zoom de 5, la taille du texte est de 24
              ]
            }
          }}
        ></SymbolLayer>
      </GeoJSON>
    {/if}
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
