<script>
  // @ts-nocheck
  import { dataStore } from '../../shared/store';
  import {
    getSumOf,
    findMinMax,
    findAllObjectsByAttribute,
    uniqueValues
  } from '../../shared/utilitaire';
  import Chart from 'chart.js/auto';
  import {
    Drawer,
    Button,
    CloseButton,
    SidebarDropdownWrapper,
    Card,
    Listgroup,
    Avatar
  } from 'flowbite-svelte';
  import { InfoCircleSolid, ArrowRightOutline, BadgeCheckOutline } from 'flowbite-svelte-icons';
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
  import { onMount, afterUpdate, onDestroy } from 'svelte';
  let clickedFeature;
  let trigger = true;
  let dataArr2 = [];
  let mandatData = [];
  let statisticsPerRegion = [];
  let MinMax = {};
  let geojsonRegionCentroid;
  let unsubscribe;
  let nom_commune;
  let detailsMandatCommune = [];
  let clickedLayerInfo = null; // Variable to store information about the clicked layer
  let anneeDebutMandat = [];
  let anneeFinMandat = [];

  onMount(async () => {
    const response = await fetch('./data/gadm41_CMR_1_centroid.geojson');
    geojsonRegionCentroid = await response.json();

    unsubscribe = await dataStore.subscribe((store) => {
      dataArr2 = store.dataArr;
      mandatData = store.mandatData;
    });
  });

  onMount(() => {
    // Utilisez onMount pour charger le GeoJSON depuis l'URL externe
    /*  const ctx = document.getElementById('detailMandatForAMunicipality');
    const chart = new Chart(ctx, {
      //Type of the chart
      type: 'pie',
      data: {
        //labels on x-axis
        labels: [],
        datasets: [
          {
            //The label for the dataset which appears in the legend and tooltips.
            label: 'Price',
            //data for the line
            data: [],
            //styling of the chart
            backgroundColor: ['rgba(255, 99, 132, 0.2)'],
            borderColor: ['rgba(255, 99, 132, 1)'],
            borderWidth: 1
          }
        ]
      },
      options: {
        scales: {
          //make sure Y-axis starts at 0
          y: {
            beginAtZero: true
          }
        }
      }
    }); */
  });

  $: {
    if (dataArr2.length > 0 && trigger == true) {
      statisticsPerRegion = getSumOf(dataArr2, 'Région');
      MinMax = findMinMax(statisticsPerRegion, 'value');
      let trigger = false;
    }
  }
  let hiddenBackdropFalse = true;

  let transitionParamsRight = {
    x: 320,
    duration: 200,
    easing: sineIn
  };

  function handleLayerClick(e) {
    // Set the variable with information about the clicked layer
    clickedLayerInfo = e;

    nom_commune = e.detail.features[0].properties.NAME_3;
    console.log(nom_commune);
    detailsMandatCommune = findAllObjectsByAttribute(mandatData, 'COMMUNE', nom_commune);

    anneeDebutMandat = uniqueValues(detailsMandatCommune, 'DEBUT MANDAT');
    anneeFinMandat = uniqueValues(detailsMandatCommune, 'FIN MANDAT');
    console.log(detailsMandatCommune);
    // Set hiddenBackdropFalse to false to show the Drawer
    hiddenBackdropFalse = false;
  }

  // On se désabonne pour éviter les fuites de data
  onDestroy(() => {
    unsubscribe;
  });
</script>

<Drawer
  placement="right"
  transitionType="fly"
  backdrop={true}
  transitionParams={transitionParamsRight}
  bind:hidden={hiddenBackdropFalse}
  id="sidebar6"
>
  <div class="flex items-center">
    <h5
      id="drawer-label"
      class="inline-flex items-center mb-4 text-base font-semibold text-gray-500 dark:text-gray-400"
    >
      <InfoCircleSolid class="w-4 h-4 me-2.5" />Historique municipal
    </h5>
    <CloseButton on:click={() => (hiddenBackdropFalse = true)} class="mb-4 dark:text-white" />
  </div>
  <h2 class="mb-6 text-center text-gray-900 text-lg dark:text-gray-400">
    {clickedLayerInfo.detail.features[0].properties.NAME_3}
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
</Drawer>

<!-- Use the reactive dataArr to update the JoinedData component -->
{#if dataArr2.length > 0 && trigger == true}
  <div />

  <MapLibre
    style="https://basemaps.cartocdn.com/gl/positron-gl-style/style.json"
    center={[12, 6]}
    zoom={5}
    attributionControl={false}
    let:map
    class="w-screen"
  >
    <!-- Tu peux également définir l'attribut `standardControls` de la carte pour créer ces contrôles. -->
    <NavigationControl position="top-right" />
    <GeolocateControl position="top-right" fitBoundsOptions={{ maxZoom: 25 }} />
    <FullscreenControl position="top-right" />
    <ScaleControl />

    <VectorTileSource url={'pmtiles://data/region.pmtiles'} promoteId={'NAME_1'}>
      <FillLayer
        paint={{
          'fill-opacity': hoverStateFilter(0.7, 0.4),

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
        }}
        manageHoverState
        sourceLayer={'regions'}
        maxzoom={8}
        on:click={(e) => console.log(e.detail.features?.[0]?.state)}
      />
      <JoinedData data={statisticsPerRegion} idCol="Région" sourceLayer="regions" />
    </VectorTileSource>

    <GeoJSON data={geojsonRegionCentroid}>
      <JoinedData data={statisticsPerRegion} idCol="Région" />
      <MarkerLayer let:feature maxzoom={6}>
        {#each statisticsPerRegion as { Région, value }}
          {#if feature.properties.NAME_1 === Région}
            <div class="bg-gray-200 rounded-full p-2 shadow align flex flex-col items-center">
              <div class="text-sm font-bold">{feature.properties.NAME_1}</div>
              <div class="text-sm font-bold">{value} projets</div>
            </div>
          {/if}
        {/each}
      </MarkerLayer>
    </GeoJSON>

    <VectorTileSource url={'pmtiles://data/departements.pmtiles'} promoteId={'NAME_2'}>
      <FillLayer
        paint={{
          'fill-opacity': 0.6,
          'fill-color': 'green'
        }}
        sourceLayer={'departements'}
        minzoom={6}
        maxzoom={8}
      />
      <LineLayer
        paint={{
          'line-opacity': 1,
          'line-width': 3,
          'line-color': 'orange'
        }}
        sourceLayer={'departements'}
        minzoom={6}
      />
    </VectorTileSource>

    <VectorTileSource url={'pmtiles://data/municipalites.pmtiles'} promoteId={'NAME_3'}>
      <FillLayer
        paint={{
          'fill-opacity': hoverStateFilter(0.7, 0.4),
          'fill-color': 'green'
        }}
        manageHoverState
        sourceLayer={'municipalites'}
        minzoom={8}
        }}
        on:click={handleLayerClick}
      />
      <LineLayer
        paint={{
          'line-opacity': 1,
          'line-color': 'white'
        }}
        sourceLayer={'municipalites'}
        minzoom={8}
      />
      <SymbolLayer
        paint={{
          'text-color': '#333',
          'text-opacity': 0.8,
          'text-halo-color': '#eee',
          'text-halo-width': 0.5,
          'text-halo-blur': 0.5
        }}
        layout={{
          'text-allow-overlap': true,
          'text-field': ['get', 'NAME_3'],
          'text-halo-color': '#eee',
          'text-halo-width': 0.5,
          'text-halo-blur': 0.5,
          'text-size': [
            'interpolate',
            ['linear'],
            ['zoom'],
            8, // Niveau de zoom de départ
            16, // Taille du texte à 3 de zoom
            25, // Niveau de zoom de fin
            240 // Taille du texte à 5 de zoom
          ]
        }}
        minzoom={8}
        sourceLayer={'municipalites'}
      />
    </VectorTileSource>
  </MapLibre>
{/if}
